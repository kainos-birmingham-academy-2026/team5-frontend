variable "name" {
  description = "Name of the Container Apps environment."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]{0,30}[a-zA-Z0-9]$", var.name)) && length(var.name) <= 32
    error_message = "Environment name must be 2-32 characters, start with a letter, and contain only alphanumerics or hyphens."
  }
}

variable "log_analytics_workspace_name" {
  description = "Name of the Log Analytics workspace used by the environment."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]{2,61}[a-zA-Z0-9]$", var.log_analytics_workspace_name))
    error_message = "Log Analytics workspace name must be 4-63 characters, start with a letter, and contain only alphanumerics or hyphens."
  }
}

variable "resource_group_name" {
  description = "Resource group that will contain the environment and workspace."
  type        = string
}

variable "location" {
  description = "Azure region for the environment and workspace."
  type        = string
}

variable "log_retention_in_days" {
  description = "How long Container Apps logs are retained in Log Analytics."
  type        = number
  default     = 30

  validation {
    condition     = var.log_retention_in_days >= 30 && var.log_retention_in_days <= 730
    error_message = "Log retention must be between 30 and 730 days."
  }
}

variable "tags" {
  description = "Tags applied to the environment and workspace."
  type        = map(string)
  default     = {}
}
