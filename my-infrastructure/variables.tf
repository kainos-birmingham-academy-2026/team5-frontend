variable "project" {
  description = "Short project/team identifier used to build resource names."
  type        = string
  default     = "jaleel-team5"

  validation {
    condition     = can(regex("^[a-z0-9-]{2,24}$", var.project))
    error_message = "Project must be 2-24 lowercase alphanumerics or hyphens."
  }
}

variable "environment" {
  description = "Deployment environment. Drives resource naming and tagging."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, prod."
  }
}

# Escape hatch for resources that pre-date the naming convention.
variable "resource_group_name" {
  description = "Optional override for the resource group name. Leave null to use rg-<project>-<environment>."
  type        = string
  default     = null

  validation {
    condition = var.resource_group_name == null || (
      can(regex("^[a-zA-Z0-9._()-]{1,90}$", coalesce(var.resource_group_name, "placeholder"))) &&
      !endswith(coalesce(var.resource_group_name, "placeholder"), ".")
    )
    error_message = "Resource group name must be 1-90 characters of alphanumerics, underscores, parentheses, hyphens or periods, and cannot end with a period."
  }
}

variable "location" {
  description = "Azure region the resource group is created in. Extend the allowed list below as needed."
  type        = string
  default     = "uksouth"

  validation {
    condition = contains([
      "uksouth",
      "ukwest",
      "westeurope",
      "northeurope",
      "eastus",
      "eastus2",
      "westus2",
      "westus3",
    ], var.location)
    error_message = "Location must be one of the approved regions listed in variables.tf."
  }
}

variable "tags" {
  description = "Additional tags merged into the tags applied to every resource."
  type        = map(string)
  default     = {}
}

variable "key_vault_name" {
  description = "Optional override for the Key Vault name. Leave null to use kv-<project>-<environment>."
  type        = string
  default     = null

  validation {
    condition     = var.key_vault_name == null || can(regex("^[a-zA-Z][a-zA-Z0-9-]{1,22}[a-zA-Z0-9]$", coalesce(var.key_vault_name, "kv-placeholder")))
    error_message = "Key Vault name must be 3-24 characters, start with a letter, and contain only alphanumerics or hyphens."
  }
}

variable "key_vault_admin_object_ids" {
  description = "Entra object IDs granted Key Vault Administrator so they can add secrets in the portal. The Terraform runner is not included; grant that principal Key Vault Secrets Officer outside Terraform."
  type        = list(string)
  default     = []
}

variable "key_vault_secrets_user_object_ids" {
  description = "Extra Entra object IDs granted Key Vault Secrets User. The user-assigned Container App identity is always included."
  type        = list(string)
  default     = []
}

variable "managed_identity_name" {
  description = "Optional override for the user-assigned identity name. Leave null to use id-<project>-<environment>."
  type        = string
  default     = null

  validation {
    condition     = var.managed_identity_name == null || can(regex("^[a-zA-Z0-9][a-zA-Z0-9-_]{1,126}[a-zA-Z0-9]$", coalesce(var.managed_identity_name, "id-placeholder")))
    error_message = "Identity name must be 3-128 characters of alphanumerics, hyphens or underscores, and cannot start or end with a hyphen or underscore."
  }
}

variable "container_app_environment_name" {
  description = "Optional override for the Container Apps environment name. Leave null to use cae-<project>-<environment>."
  type        = string
  default     = null

  validation {
    condition = var.container_app_environment_name == null || (
      can(regex("^[a-zA-Z][a-zA-Z0-9-]{0,30}[a-zA-Z0-9]$", coalesce(var.container_app_environment_name, "cae-placeholder"))) &&
      length(coalesce(var.container_app_environment_name, "cae-placeholder")) <= 32
    )
    error_message = "Environment name must be 2-32 characters, start with a letter, and contain only alphanumerics or hyphens."
  }
}

variable "log_analytics_workspace_name" {
  description = "Optional override for the Log Analytics workspace name. Leave null to use log-<project>-<environment>."
  type        = string
  default     = null

  validation {
    condition     = var.log_analytics_workspace_name == null || can(regex("^[a-zA-Z][a-zA-Z0-9-]{2,61}[a-zA-Z0-9]$", coalesce(var.log_analytics_workspace_name, "log-placeholder")))
    error_message = "Log Analytics workspace name must be 4-63 characters, start with a letter, and contain only alphanumerics or hyphens."
  }
}

variable "container_registry_name" {
  description = "Name of the existing Azure Container Registry CI already pushes to. Looked up; not created."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z0-9]{5,50}$", var.container_registry_name))
    error_message = "ACR name must be 5-50 alphanumeric characters."
  }
}

variable "container_registry_resource_group_name" {
  description = "Resource group that already contains the Container Registry."
  type        = string
}

variable "frontend_container_app_name" {
  description = "Optional override for the frontend Container App name. Leave null to use ca-frontend-<project>-<environment>."
  type        = string
  default     = null

  validation {
    condition = var.frontend_container_app_name == null || (
      can(regex("^[a-z][a-z0-9-]{0,30}[a-z0-9]$", coalesce(var.frontend_container_app_name, "ca-placeholder"))) &&
      length(coalesce(var.frontend_container_app_name, "ca-placeholder")) <= 32
    )
    error_message = "Container App name must be 2-32 lowercase alphanumerics or hyphens."
  }
}

variable "backend_container_app_name" {
  description = "Optional override for the backend Container App name. Leave null to use ca-backend-<project>-<environment>."
  type        = string
  default     = null

  validation {
    condition = var.backend_container_app_name == null || (
      can(regex("^[a-z][a-z0-9-]{0,30}[a-z0-9]$", coalesce(var.backend_container_app_name, "ca-placeholder"))) &&
      length(coalesce(var.backend_container_app_name, "ca-placeholder")) <= 32
    )
    error_message = "Container App name must be 2-32 lowercase alphanumerics or hyphens."
  }
}

variable "frontend_image_name" {
  description = "Repository name in ACR for the frontend image."
  type        = string
  default     = "team5-frontend"
}

variable "frontend_image_tag" {
  description = "Tag of the frontend image to run. CI pushes :latest and :<sha>."
  type        = string
  default     = "latest"
}

variable "backend_image_name" {
  description = "Repository name in ACR for the backend image."
  type        = string
  default     = "team5-backend"
}

variable "backend_image_tag" {
  description = "Tag of the backend image to run."
  type        = string
  default     = "latest"
}

variable "frontend_target_port" {
  description = "Port the frontend container listens on (Dockerfile EXPOSE 4000)."
  type        = number
  default     = 4000
}

variable "backend_target_port" {
  description = "Port the backend container listens on."
  type        = number
  default     = 3000
}

variable "frontend_env" {
  description = "Extra plain environment variables for the frontend. API_BASE_URL and NODE_ENV are set automatically."
  type        = map(string)
  default     = {}
}

variable "backend_env" {
  description = "Plain environment variables for the backend (non-secret)."
  type        = map(string)
  default = {
    NODE_ENV = "production"
  }
}

variable "frontend_secret_env" {
  description = "Frontend env var name to Key Vault secret name. Create the secrets in the portal before apply."
  type        = map(string)
  default = {
    SESSION_SECRET = "SESSION-SECRET"
  }
}

variable "backend_secret_env" {
  description = "Backend env var name to Key Vault secret name. Create the secrets in the portal before apply."
  type        = map(string)
  default     = {}
}
