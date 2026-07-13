// Defines which component types are allowed inside each container type.
// '*' = accepts anything. Missing key = not a container or no restriction.
// Used to validate drops and show helpful error messages.

export const ALLOWED_CHILDREN: Record<string, string[] | '*'> = {

  // ── AWS ──────────────────────────────────────────────────────────────────────

  aws_region: [
    // Network containers
    'aws_vpc',
    // Regional services (no VPC required)
    'aws_s3_bucket',
    'aws_cloudfront_distribution',
    'aws_route53_zone',
    'aws_sqs_queue',
    'aws_sns_topic',
    'aws_dynamodb_table',
    'aws_lambda_function',
    'aws_api_gateway_rest_api',
    'aws_apigatewayv2_api',
    'aws_ecr_repository',
    'aws_ecs_cluster',
    'aws_rds_cluster',
    'aws_elasticache_cluster',
    'aws_elasticache_replication_group',
    'aws_elasticsearch_domain',
    'aws_kinesis_stream',
    'aws_kinesis_firehose_delivery_stream',
    'aws_glue_job',
    'aws_athena_database',
    'aws_sagemaker_endpoint',
    'aws_codepipeline',
    'aws_codebuild_project',
    'aws_cloudwatch_metric_alarm',
    'aws_secretsmanager_secret',
    'aws_ssm_parameter',
    'aws_kms_key',
    'aws_iam_role',
    'aws_wafv2_web_acl',
  ],

  aws_vpc: [
    // Sub-containers
    'aws_subnet',
    'aws_availability_zone',
    // VPC-level networking
    'aws_internet_gateway',
    'aws_vpn_gateway',
    'aws_vpc_endpoint',
    'aws_vpc_peering_connection',
    'aws_security_group',
    'aws_network_acl',
    'aws_route_table',
    'aws_nat_gateway',
    'aws_egress_only_internet_gateway',
    'aws_customer_gateway',
    'aws_transit_gateway',
    // VPC-scoped load balancers (span subnets)
    'aws_lb',
    // DB subnet groups
    'aws_db_subnet_group',
    'aws_elasticache_subnet_group',
  ],

  aws_availability_zone: [
    'aws_subnet',
  ],

  aws_subnet: [
    // Compute
    'aws_instance',
    'aws_launch_template',
    'aws_autoscaling_group',
    'aws_elastic_beanstalk_environment',
    // Containers
    'aws_ecs_cluster',
    'aws_ecs_service',
    'aws_eks_cluster',
    // Database
    'aws_db_instance',
    'aws_rds_cluster',
    'aws_elasticache_cluster',
    'aws_elasticache_replication_group',
    // Serverless
    'aws_lambda_function',
    // Networking
    'aws_nat_gateway',
    'aws_lb',
    'aws_lb_target_group',
    'aws_route_table',
    'aws_network_acl',
    'aws_vpc_endpoint',
    // Misc
    'aws_instance',
  ],

  // ── Azure ─────────────────────────────────────────────────────────────────────

  azurerm_region: [
    'azurerm_virtual_network',
    'azurerm_storage_account',
    'azurerm_cognitive_account',
    'azurerm_servicebus_namespace',
    'azurerm_eventhub_namespace',
    'azurerm_cosmosdb_account',
    'azurerm_sql_server',
    'azurerm_key_vault',
    'azurerm_app_service',
    'azurerm_function_app',
    'azurerm_container_registry',
    'azurerm_kubernetes_cluster',
    'azurerm_api_management',
    'azurerm_cdn_profile',
    'azurerm_frontdoor',
    'azurerm_traffic_manager_profile',
    'azurerm_log_analytics_workspace',
    'azurerm_monitor_action_group',
    'azurerm_data_factory',
    'azurerm_databricks_workspace',
    'azurerm_stream_analytics_job',
    'azurerm_machine_learning_workspace',
  ],

  azurerm_virtual_network: [
    'azurerm_subnet',
    'azurerm_network_security_group',
    'azurerm_route_table',
    'azurerm_virtual_network_gateway',
    'azurerm_vpn_gateway',
    'azurerm_private_endpoint',
    'azurerm_public_ip',
    'azurerm_nat_gateway',
    'azurerm_application_gateway',
    'azurerm_load_balancer',
    'azurerm_firewall',
    'azurerm_bastion_host',
    'azurerm_virtual_network_peering',
  ],

  azurerm_subnet: [
    'azurerm_linux_virtual_machine',
    'azurerm_windows_virtual_machine',
    'azurerm_linux_virtual_machine_scale_set',
    'azurerm_kubernetes_cluster',
    'azurerm_app_service',
    'azurerm_function_app',
    'azurerm_sql_server',
    'azurerm_mssql_server',
    'azurerm_postgresql_server',
    'azurerm_mysql_server',
    'azurerm_redis_cache',
    'azurerm_load_balancer',
    'azurerm_application_gateway',
    'azurerm_network_security_group',
    'azurerm_route_table',
    'azurerm_nat_gateway',
    'azurerm_private_endpoint',
    'azurerm_container_group',
  ],

  // ── GCP ───────────────────────────────────────────────────────────────────────

  google_region: [
    'google_compute_network',
    'google_storage_bucket',
    'google_pubsub_topic',
    'google_pubsub_subscription',
    'google_cloudfunctions_function',
    'google_cloud_run_service',
    'google_sql_database_instance',
    'google_bigtable_instance',
    'google_spanner_instance',
    'google_bigquery_dataset',
    'google_container_cluster',
    'google_artifact_registry_repository',
    'google_compute_instance_template',
    'google_compute_instance_group_manager',
    'google_cloudbuild_trigger',
    'google_logging_metric',
    'google_monitoring_alert_policy',
    'google_dataflow_job',
    'google_dataproc_cluster',
    'google_composer_environment',
    'google_ml_engine_model',
    'google_secret_manager_secret',
  ],

  google_compute_network: [
    'google_compute_subnetwork',
    'google_compute_firewall',
    'google_compute_router',
    'google_compute_vpn_gateway',
    'google_compute_interconnect_attachment',
    'google_compute_global_address',
    'google_compute_address',
    'google_compute_backend_service',
    'google_compute_url_map',
    'google_compute_target_http_proxy',
    'google_compute_forwarding_rule',
    'google_dns_managed_zone',
    'google_service_networking_connection',
  ],

  google_compute_subnetwork: [
    'google_compute_instance',
    'google_container_cluster',
    'google_container_node_pool',
    'google_compute_instance_group_manager',
    'google_cloud_run_service',
    'google_sql_database_instance',
    'google_compute_address',
    'google_compute_forwarding_rule',
    'google_compute_backend_service',
    'google_compute_router',
    'google_cloudfunctions_function',
    'google_dataflow_job',
    'google_dataproc_cluster',
    'google_composer_environment',
  ],
}

// Human-readable container label for error messages
const CONTAINER_LABELS: Record<string, string> = {
  aws_region: 'AWS Region',
  aws_vpc: 'VPC',
  aws_availability_zone: 'Availability Zone',
  aws_subnet: 'Subnet',
  azurerm_region: 'Azure Region',
  azurerm_virtual_network: 'Virtual Network',
  azurerm_subnet: 'Azure Subnet',
  google_region: 'GCP Region',
  google_compute_network: 'VPC Network',
  google_compute_subnetwork: 'Subnetwork',
}

// Returns null if allowed, or an error message string if not
export function validateDrop(
  componentType: string,
  componentLabel: string,
  containerType: string
): string | null {
  const allowed = ALLOWED_CHILDREN[containerType]
  if (!allowed) return null  // container has no restrictions defined
  if (allowed === '*') return null
  if (allowed.includes(componentType)) return null

  const containerLabel = CONTAINER_LABELS[containerType] ?? containerType
  return `"${componentLabel}" cannot be placed inside a ${containerLabel}. Check the AWS/Azure/GCP console for valid placement.`
}

// Find the correct parent container suggestion for a component
export function suggestParent(componentType: string): string[] {
  return Object.entries(ALLOWED_CHILDREN)
    .filter(([, children]) => children !== '*' && (children as string[]).includes(componentType))
    .map(([k]) => CONTAINER_LABELS[k] ?? k)
}
