using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace CaseCreationPlugin
{
    public class PreventDuplicateOpenCases : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = serviceFactory.CreateOrganizationService(context.UserId);

                // Retrieve the target entity and customer ID
                var targetEntity = GetTargetEntity(context, tracingService);
                if (targetEntity == null) return;  // If target is invalid, exit

                var customer = GetCustomer(targetEntity, tracingService);
                if (customer == null || customer.LogicalName != "account") return;  // If customer ID is invalid or the customer isn't an account, exit

                // Check if the customer has any open cases
                if (HasOpenCases(service, customerId))
                {
                    throw new InvalidPluginExecutionException(
                        $"The account {customerId}, already has an open case. Only one active case is allowed at a time. Please resolve/close any open cases.");
                }

                tracingService.Trace($"Success: Case creation allowed. No open cases found for customer with ID: {customerId}.");
            }
            catch (InvalidPluginExecutionException ex)
            {
                tracingService.Trace($"Error: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                tracingService.Trace($"Unhandled Exception: {ex.Message}");
                tracingService.Trace($"Stack Trace: {ex.StackTrace}");
                throw new InvalidPluginExecutionException("An unexpected error occurred while processing the plugin. Please contact your system administrator.");
            }
        }

        /// <summary>
        /// Retrieves the target entity from the context.
        /// </summary>
        private Entity GetTargetEntity(IPluginExecutionContext context, ITracingService tracingService)
        {
            if (!context.InputParameters.Contains("Target") || !(context.InputParameters["Target"] is Entity entity))
            {
                tracingService.Trace("Target entity is missing or invalid.");
                return null;  // Return null if invalid
            }

            return entity;  // Return valid target entity
        }

        /// <summary>
        /// Retrieves the customer ID from the target entity.
        /// </summary>
        private EntityReference GetCustomer(Entity targetEntity, ITracingService tracingService)
        {
            if (!targetEntity.Contains("customerid") || !(targetEntity["customerid"] is EntityReference customerReference))
            {
                tracingService.Trace("Customer ID is missing or invalid on the target entity.");
                throw new InvalidPluginExecutionException("Customer information is required to create a case.");
            }

            return customerReference;  // Return the customer Ref
        }

        /// <summary>
        /// Checks if the specified customer has any open cases.
        /// </summary>
        private bool HasOpenCases(IOrganizationService service, Guid customerId)
        {
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
            return openCases.Entities.Count > 0;  // Returns true if there are open cases, false otherwise
        }
    }
}
