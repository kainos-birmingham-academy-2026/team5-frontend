project     = "jaleel-team5"
environment = "dev"
location    = "uksouth"

# Shared academy registry. CI pushes team5-frontend here (ACR_LOGIN_SERVER).
container_registry_name                = "acraiacademy26"
container_registry_resource_group_name = "rg-ai-academy-26"

tags = {
  team       = "team5"
  cost_owner = "jaleel"
}
