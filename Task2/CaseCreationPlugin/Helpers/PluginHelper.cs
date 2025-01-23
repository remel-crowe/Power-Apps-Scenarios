using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace CaseCreationPlugin.Helpers
{
    /// <summary>
    /// Helper class for common plugin operations.
    /// </summary>
    public static class PluginHelper
    {
        /// <summary>
        /// Retrieves the target entity from the plugin execution context.
        /// </summary>
        /// <param name="context">The plugin execution context.</param>
        /// <param name="tracingService">The tracing service for logging.</param>
        /// <returns>The target entity if valid; otherwise, null.</returns>
        public static Entity GetTargetEntity(IPluginExecutionContext context, ITracingService tracingService)
        {
            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity entity)
            {
                return entity;
            }

            tracingService.Trace("Target entity is missing or invalid.");
            return null;
        }

        /// <summary>
        /// Retrieves the customer reference from the target entity.
        /// </summary>
        /// <param name="targetEntity">The target entity containing the customer reference.</param>
        /// <param name="tracingService">The tracing service for logging.</param>
        /// <returns>The customer reference if valid.</returns>
        /// <exception cref="InvalidPluginExecutionException">Thrown when the customer ID is missing or invalid.</exception>
        public static EntityReference GetCustomer(Entity targetEntity, ITracingService tracingService)
        {
            if (targetEntity.Contains("customerid") && targetEntity["customerid"] is EntityReference customerReference)
            {
                return customerReference;
            }

            tracingService.Trace("Customer ID is missing or invalid on the target entity.");
            throw new InvalidPluginExecutionException("Customer information is required to create a case.");
        }

        /// <summary>
        /// Checks if the specified customer has any open cases.
        /// </summary>
        /// <param name="service">The organization service for querying data.</param>
        /// <param name="customerId">The ID of the customer to check for open cases.</param>
        /// <returns>True if there are open cases; otherwise, false.</returns>
        public static bool HasOpenCases(IOrganizationService service, Guid customerId)
        {
            if (service == null)
            {
                throw new ArgumentNullException(nameof(service), "The organization service cannot be null.");
            }

            var query = new QueryExpression("incident")
            {
                ColumnSet = new ColumnSet("statecode"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("customerid", ConditionOperator.Equal, customerId),
                        new ConditionExpression("statecode", ConditionOperator.Equal, 0) // 0 = Active
                    }
                }
            };

            var openCases = service.RetrieveMultiple(query);
            return openCases.Entities.Count > 0;
        }
    }
}
