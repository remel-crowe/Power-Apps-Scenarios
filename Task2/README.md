# Dynamics 365 Case Creation Prevention Plugin

## Overview

The `PreventDuplicateOpenCases` plugin is a Dynamics 365 custom plugin designed to prevent the creation of a new case (incident) if the associated customer already has an active case. Triggered during the **PreValidation** stage of the execution pipeline, the plugin enforces this business rule before the record is committed to the database. 

## Helper Methods

The plugin leverages the following static helper methods, located in the `PluginHelper` file. These methods encapsulate specific logic, such as retrieving the target entity, extracting the customer ID, and checking for active cases:

1. **`GetTargetEntity`**  
   - Retrieves the target entity from the execution context, ensuring only `incident` records are processed.

2. **`GetCustomerId`**  
   - Extracts the `customerid` from the target entity, encapsulating entity-specific logic.

3. **`HasOpenCases`**  
   - Encapsulates the logic for querying Dynamics 365 to determine whether the customer has any active cases.

By having these methods in a dedicated `PluginHelper` file as static methods, the plugin achieves better modularity and adherence to the Single Responsibility Principle.

## Error Handling and Trace Logging

The plugin enforces its validation logic by throwing an `InvalidPluginExecutionException` when an active case is detected for the customer. This exception stops the execution pipeline and displays a user-friendly error message, including the customer's ID for context.

The plugin leverages **trace logging** using `ITracingService`. Key details logged include:

- Whether the case creation was allowed or blocked.
- The customer ID and validation results for debugging purposes.

This approach ensures that both users and administrators have clear feedback, with trace logs providing a deeper level of detail for troubleshooting.

## Further Enhancements

The plugin is functional as designed, but several enhancements could add value:

1. **Enhanced Error Details**  
   Include additional information about the active case in the error message, such as the case title, creation date, or assigned owner.

2. **Refactor to Helper Classes**  
   The current `PluginHelper` file provides a single location for static helper methods. Refactoring these into dedicated classes (e.g., `CaseValidator`, `EntityHelper`) could further improve scalability. However, I beleive the current structure is sufficient for the current scope.

## File Structure

- **PreventDuplicateOpenCases Plugin**: Core plugin logic, which utilises the methods in `PluginHelper` for validation and processing.
- **PluginHelper**: Contains the static helper methods `GetTargetEntity`, `GetCustomerId`, and `HasOpenCases`.

This structure ensures separation of concerns, improves readability, and supports future scalability.

