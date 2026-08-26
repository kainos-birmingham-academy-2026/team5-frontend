#!/usr/bin/env bash
# Creates the Azure Storage backend that holds team5's Terraform state.
# Run once per team, before `terraform init -migrate-state`. Safe to re-run.
set -euo pipefail

LOCATION="${LOCATION:-uksouth}"
STATE_RG="${STATE_RG:-rg-jaleel-team5-state}"
STATE_SA="${STATE_SA:-jaleelteam5state}"
STATE_CONTAINER="${STATE_CONTAINER:-tfstate}"

subscription_id="$(az account show --query id -o tsv)"
echo "Subscription: ${subscription_id}"
echo "Backend:      ${STATE_RG} / ${STATE_SA} / ${STATE_CONTAINER} (${LOCATION})"

az group create \
  --name "${STATE_RG}" \
  --location "${LOCATION}" \
  --tags team=team5 purpose=terraform-state managed_by=bootstrap-script \
  --output none

if ! az storage account show --name "${STATE_SA}" --resource-group "${STATE_RG}" --output none 2>/dev/null; then
  if [[ "$(az storage account check-name --name "${STATE_SA}" --query nameAvailable -o tsv)" != "true" ]]; then
    echo "Storage account name '${STATE_SA}' is taken globally. Re-run with STATE_SA=<unique-name>." >&2
    exit 1
  fi

  az storage account create \
    --name "${STATE_SA}" \
    --resource-group "${STATE_RG}" \
    --location "${LOCATION}" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --min-tls-version TLS1_2 \
    --https-only true \
    --allow-blob-public-access false \
    --tags team=team5 purpose=terraform-state \
    --output none
fi

# Versioning and soft delete let you recover a corrupted or deleted state blob.
az storage account blob-service-properties update \
  --account-name "${STATE_SA}" \
  --resource-group "${STATE_RG}" \
  --enable-versioning true \
  --enable-delete-retention true \
  --delete-retention-days 30 \
  --output none

account_key="$(az storage account keys list \
  --account-name "${STATE_SA}" \
  --resource-group "${STATE_RG}" \
  --query '[0].value' -o tsv)"

az storage container create \
  --name "${STATE_CONTAINER}" \
  --account-name "${STATE_SA}" \
  --account-key "${account_key}" \
  --output none

echo "Done. Next: terraform init -migrate-state"
