import json
from anthropic import AsyncAnthropic
from app.config import settings
from app.models.diagram import Diagram

_anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are a senior cloud infrastructure engineer producing production-ready Infrastructure as Code.

Given a cloud architecture diagram as JSON, generate IaC that:
- Uses exact resource types matching the diagram node types (aws_instance → aws_instance, etc.)
- Applies all config properties from each node's "config" object as resource arguments
- Uses "inheritedConfig" values (region, vpc_id, subnet_id, cidr_block, etc.) to wire resources together — these come from parent containers
- Follows the edges array to establish depends_on / references between resources
- Uses best practices: least-privilege IAM, security group rules, tags, proper naming
- Outputs ONLY the IaC content — no explanations outside code comments
- Returns a JSON object: {"files": {"filename": "content", ...}}

Node structure:
- id: unique node identifier
- data.componentType: the cloud resource type (e.g. aws_instance, azurerm_linux_virtual_machine)
- data.label: human-readable name → use as resource name/tags
- data.config: user-set properties for this resource
- data.inheritedConfig: values flowing down from parent containers (region, vpc_id, subnet_id, cidr_block, availability_zone, etc.)
- parentId: ID of the parent container node (use to establish VPC/subnet relationships)

Edge structure:
- source/target: node IDs → establishes dependencies and references"""

FORMAT_INSTRUCTIONS = {
    "terraform": """Generate Terraform HCL for the given cloud provider. Split into:
- main.tf: all resource blocks, referencing variables where appropriate
- variables.tf: input variables with descriptions and defaults
- outputs.tf: useful output values (IDs, ARNs, endpoints)
- provider.tf: provider configuration

Rules:
- Use resource labels derived from node labels (snake_case)
- Wire resources using references (e.g. aws_vpc.main.id) not hardcoded IDs
- Use data sources where needed (e.g. data.aws_ami.latest)
- Add lifecycle rules for stateful resources
- Include required_providers and terraform version constraints""",

    "cloudformation": """Generate a single AWS CloudFormation template in YAML. File: template.yaml

Rules:
- Use AWSTemplateFormatVersion: "2010-09-09"
- Add meaningful Description
- Use Parameters section for configurable values
- Use !Ref and !GetAtt to wire resources together
- Add Outputs section for key resource attributes
- Use DeletionPolicy where appropriate
- Tag all resources with Name and Environment""",

    "bicep": """Generate Azure Bicep files:
- main.bicep: all resource declarations
- parameters.json: parameter values file

Rules:
- Use param declarations with @description decorators
- Use symbolic names matching node labels (camelCase)
- Wire resources using resource symbolic references (e.g. vnet.id)
- Use existing resource references where appropriate
- Add tags to all resources
- Use correct api versions for each resource type""",

    "pulumi_python": """Generate Pulumi Python code. Files:
- __main__.py: all resource declarations using pulumi SDK
- Pulumi.yaml: project file
- requirements.txt: pulumi dependencies

Rules:
- Import correct Pulumi provider packages (pulumi_aws, pulumi_azure_native, pulumi_gcp)
- Use Output.all() / apply() for cross-resource references
- Export key outputs via pulumi.export()
- Use snake_case variable names matching node labels
- Add opts=pulumi.ResourceOptions(depends_on=[...]) based on edges""",

    "pulumi_typescript": """Generate Pulumi TypeScript code. Files:
- index.ts: all resource declarations
- Pulumi.yaml: project file
- package.json: with pulumi dependencies

Rules:
- Import correct Pulumi provider packages (@pulumi/aws, @pulumi/azure-native, @pulumi/gcp)
- Use pulumi.Output<T> and .apply() for cross-resource references
- Export key outputs
- Use camelCase variable names matching node labels
- Add dependsOn in ResourceOptions based on edges""",
}


def _build_graph_summary(diagram: Diagram) -> dict:
    nodes = diagram.graph_data.get("nodes", [])
    edges = diagram.graph_data.get("edges", [])

    clean_nodes = []
    for n in nodes:
        data = n.get("data", {})
        clean_nodes.append({
            "id": n.get("id"),
            "parentId": n.get("parentId"),
            "componentType": data.get("componentType"),
            "label": data.get("label"),
            "config": data.get("config", {}),
            "inheritedConfig": data.get("inheritedConfig", {}),
        })

    clean_edges = [
        {"source": e.get("source"), "target": e.get("target"), "label": e.get("data", {}).get("label", "")}
        for e in edges
    ]

    return {
        "csp": diagram.csp,
        "title": diagram.title,
        "nodes": clean_nodes,
        "edges": clean_edges,
    }


def _build_prompt(diagram: Diagram, format: str) -> tuple[str, str]:
    graph_summary = _build_graph_summary(diagram)
    format_instruction = FORMAT_INSTRUCTIONS.get(format, FORMAT_INSTRUCTIONS["terraform"])
    user_message = f"""Architecture diagram: {diagram.title}
CSP: {diagram.csp}

Graph:
{json.dumps(graph_summary, indent=2)}

{format_instruction}

Return ONLY valid JSON: {{"files": {{"filename": "file content here"}}}}"""
    return SYSTEM_PROMPT, user_message


def _parse_response(text: str) -> dict[str, str]:
    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    result = json.loads(text)
    return result.get("files", {})


async def _generate_with_anthropic(diagram: Diagram, format: str) -> dict[str, str]:
    system, user_message = _build_prompt(diagram, format)
    response = await _anthropic_client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=16000,
        system=system,
        messages=[{"role": "user", "content": user_message}],
    )
    return _parse_response(response.content[0].text)


async def _generate_with_gemini(diagram: Diagram, format: str) -> dict[str, str]:
    import google.generativeai as genai
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_PROMPT,
    )
    _, user_message = _build_prompt(diagram, format)
    response = await model.generate_content_async(user_message)
    return _parse_response(response.text)


async def generate_iac(diagram: Diagram, format: str, provider: str = "anthropic") -> dict[str, str]:
    if provider == "gemini":
        return await _generate_with_gemini(diagram, format)
    return await _generate_with_anthropic(diagram, format)
