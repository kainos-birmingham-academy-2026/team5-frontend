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
