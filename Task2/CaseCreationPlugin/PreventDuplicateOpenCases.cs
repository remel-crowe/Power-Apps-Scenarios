using System;
using Microsoft.Xrm.Sdk;
using CaseCreationPlugin.Helpers;

namespace CaseCreationPlugin
{
    public class PreventDuplicateOpenCases : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                var service = serviceFactory.CreateOrganizationService(context.UserId);
                var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

                // Retrieve the target entity
                var targetEntity = PluginHelper.GetTargetEntity(context, tracingService);
                if (targetEntity == null) return;

                // Retrieve the customer ID from the target entity
                var customer = PluginHelper.GetCustomer(targetEntity, tracingService);
                if (customer.LogicalName != "account") return;

                // Check if the customer has any open cases
                if (PluginHelper.HasOpenCases(service, customer.Id))
                {
                    throw new InvalidPluginExecutionException(
                        $"The account {customer.Id} already has an open case. Only one active case is allowed at a time. Please resolve/close any open cases.");
                }

                tracingService.Trace($"Success: Case creation allowed. No open cases found for customer with ID: {customer.Id}.");
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
    }

}
