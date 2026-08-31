variable "name" {
  description = "Name of the user-assigned managed identity."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z0-9][a-zA-Z0-9-_]{1,126}[a-zA-Z0-9]$", var.name))
    error_message = "Identity name must be 3-128 characters of alphanumerics, hyphens or underscores, and cannot start or end with a hyphen or underscore."
  }
}

variable "resource_group_name" {
  description = "Resource group that will contain the identity."
  type        = string
}

variable "location" {
  description = "Azure region for the identity."
  type        = string
}

variable "container_registry_id" {
  description = "Optional ACR resource ID. When set, the identity is granted AcrPull on that registry."
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags applied to the identity."
  type        = map(string)
  default     = {}
}
