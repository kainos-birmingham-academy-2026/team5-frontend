terraform {
  required_version = ">= 1.5"

  # State lives in Azure Storage so the whole team shares it.
  # Locking is automatic via blob leases. Create these resources first with
  # scripts/bootstrap-remote-state.sh.
  # Left empty on purpose: each environment supplies its own settings, e.g.
  #   terraform init -backend-config=backends/dev.hcl
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# Credentials and subscription come from ARM_* environment variables, so the same
# code runs locally (az login) and in CI (service principal).
provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}

data "azurerm_client_config" "current" {}

# Existing shared academy registry. CI already pushes team5-frontend here
# (secrets.ACR_LOGIN_SERVER). Do not create a second ACR.
data "azurerm_container_registry" "existing" {
  name                = var.container_registry_name
  resource_group_name = var.container_registry_resource_group_name
}

locals {
  name_prefix         = "${var.project}-${var.environment}"
  resource_group_name = coalesce(var.resource_group_name, "rg-${local.name_prefix}")
  key_vault_name      = coalesce(var.key_vault_name, "kv-${local.name_prefix}")
  identity_name       = coalesce(var.managed_identity_name, "id-${local.name_prefix}")
  cae_name            = coalesce(var.container_app_environment_name, "cae-${local.name_prefix}")
  log_analytics_name  = coalesce(var.log_analytics_workspace_name, "log-${local.name_prefix}")
  frontend_app_name   = coalesce(var.frontend_container_app_name, "ca-frontend-${local.name_prefix}")
  backend_app_name    = coalesce(var.backend_container_app_name, "ca-backend-${local.name_prefix}")
  frontend_image      = "${data.azurerm_container_registry.existing.login_server}/${var.frontend_image_name}:${var.frontend_image_tag}"
  backend_image       = "${data.azurerm_container_registry.existing.login_server}/${var.backend_image_name}:${var.backend_image_tag}"

  common_tags = merge(
    {
      project     = var.project
      environment = var.environment
      managed_by  = "terraform"
    },
    var.tags,
  )
}

module "resource_group" {
  source = "./modules/resource-group"

  name     = local.resource_group_name
  location = var.location
  tags     = local.common_tags
}

# Keeps the already-applied resource group instead of destroying and recreating it
# now that it moved inside the module.
moved {
  from = azurerm_resource_group.main
  to   = module.resource_group.azurerm_resource_group.this
}

# Shared identity for Container Apps to read Key Vault secrets and pull from ACR.
# AcrPull is assigned when container_registry_id is passed (once ACR exists).
module "container_app_identity" {
  source = "./modules/user-assigned-identity"

  name                  = local.identity_name
  resource_group_name   = module.resource_group.name
  location              = module.resource_group.location
  container_registry_id = data.azurerm_container_registry.existing.id
  tags                  = local.common_tags
}

# Empty vault. Secret values and access assignments are managed outside Terraform.
module "key_vault" {
  source = "./modules/key-vault"

  name                = local.key_vault_name
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  tags                = local.common_tags
}

# Keep the existing manually managed assignments in Azure while removing them
# from Terraform state. This avoids requiring RBAC administrator permissions.
removed {
  from = module.key_vault.azurerm_role_assignment.administrators

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.key_vault.azurerm_role_assignment.secrets_users

  lifecycle {
    destroy = false
  }
}

# Shared platform for later Container Apps. Log Analytics is required so
# replica logs are queryable in the portal.
module "container_app_environment" {
  source = "./modules/container-apps-environment"

  name                         = local.cae_name
  log_analytics_workspace_name = local.log_analytics_name
  resource_group_name          = module.resource_group.name
  location                     = module.resource_group.location
  tags                         = local.common_tags
}

# Internal only. Frontend reaches this over the environment's private ingress.
module "backend_app" {
  source = "./modules/container-app"

  name                            = local.backend_app_name
  container_name                  = "backend"
  resource_group_name             = module.resource_group.name
  container_app_environment_id    = module.container_app_environment.id
  image                           = local.backend_image
  target_port                     = var.backend_target_port
  external_enabled                = false
  identity_id                     = module.container_app_identity.id
  container_registry_login_server = data.azurerm_container_registry.existing.login_server
  key_vault_uri                   = module.key_vault.uri
  env                             = var.backend_env
  secret_env                      = var.backend_secret_env
  tags                            = local.common_tags
}

# Public-facing UI. API_BASE_URL is the backend's internal HTTPS URL.
module "frontend_app" {
  source = "./modules/container-app"

  name                            = local.frontend_app_name
  container_name                  = "frontend"
  resource_group_name             = module.resource_group.name
  container_app_environment_id    = module.container_app_environment.id
  image                           = local.frontend_image
  target_port                     = var.frontend_target_port
  external_enabled                = true
  identity_id                     = module.container_app_identity.id
  container_registry_login_server = data.azurerm_container_registry.existing.login_server
  key_vault_uri                   = module.key_vault.uri
  env = merge(
    {
      NODE_ENV     = "production"
      API_BASE_URL = module.backend_app.url
    },
    var.frontend_env,
  )
  secret_env = var.frontend_secret_env
  tags       = local.common_tags
}
