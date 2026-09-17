variable "name" {
  description = "Globally unique Azure Storage Account name."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9]{3,24}$", var.name))
    error_message = "Storage Account name must be 3-24 lowercase letters or numbers."
  }
}

variable "resource_group_name" {
  description = "Name of the resource group containing the Storage Account."
  type        = string
}

variable "location" {
  description = "Azure region for the Storage Account."
  type        = string
}

variable "tags" {
  description = "Tags applied to the Storage Account."
  type        = map(string)
  default     = {}
}

variable "blob_delete_retention_days" {
  description = "Number of days soft-deleted blobs can be recovered."
  type        = number
  default     = 7

  validation {
    condition     = var.blob_delete_retention_days >= 1 && var.blob_delete_retention_days <= 365
    error_message = "blob_delete_retention_days must be between 1 and 365."
  }
}

variable "malware_scanning_monthly_cap_gb" {
  description = "Maximum number of GB Defender for Storage scans each month."
  type        = number
  default     = 10

  validation {
    condition     = var.malware_scanning_monthly_cap_gb >= 0 && var.malware_scanning_monthly_cap_gb <= 5000
    error_message = "malware_scanning_monthly_cap_gb must be between 0 and 5000."
  }
}