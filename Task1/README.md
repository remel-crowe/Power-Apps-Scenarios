# Dynamics 365 Case Form Customisation

## Overview

This project enhances the Dynamics 365 Case form by implementing functionality to auto-populate the **Primary Contact** field and manage the behaviour of the **Quick View control**. It employs a combination of object-oriented principles and utility-based functions to ensure scalability, maintainability, and testability.

While a functional programming approach could have been utilised, feedback from Scenario 1 influenced the decision to adopt a class-based architecture to better adhere to **SOLID design principles**.


## Solution Structure

The solution is split into two scripts:

1. **Main Case Form Script:**  
   Manages primary logic related to the Case form, including setting and validating the **Primary Contact**. 

2. **Quick View Management Script:**  
   Handles the behaviour of the Quick View control, ensuring it displays relevant fields when the **Primary Contact** is set.


## Key Components (Main Case Form Script)

### 1. **`DynamicsService`**  
A generic service for interacting with the Dynamics Web API.

### 2. **`AccountService`**  
Handles account-related logic, such as retrieving the **Primary Contact** ID for an account.

### 3. **`ContactService`**  
Manages contact-related logic, including fetching contact details.

### 4. **Utility Functions**  
Standalone utility functions replace some single-method classes to simplify the solution. For example, determining customer type is now handled by a utility function.

### 5. **`FormUtility`**  
A dedicated utility class for interacting with the Case form, decoupling form-specific logic from business logic. Tasks include:  
- Retrieving field values.  
- Hiding or showing fields.  
- Setting required levels for fields.

### 6. **`PrimaryContactHandler`**  
Coordinates the various services and utilities to manage the **Primary Contact** functionality on the Case form. This focuses on business rules while delegating form interactions to the `FormUtility`.


## Key Components (Quick View Management Script)

### 1. **Quick View Logic**  
This script manages the dynamic behaviour of the Quick View control, ensuring that:  
- The control displays relevant fields based on the **Primary Contact** selection.  
- The control is hidden when no Primary Contact is selected.  
- Additional error handling is provided to ensure graceful fallback if Quick View data is unavailable.


## Alternative Approaches and Add-Ons

### 1. **Handle Missing Primary Contact for Accounts**  
If the customer is an **Account** without a primary contact, the solution could provide a control for users to manually input contact details, such as an email address or phone number.

### 2. **Relate Contacts to Accounts**  
For customers of type **Contact** who are linked to an Account, the solution could be extended to:  
- Automatically detect and set the related Account as the customer.  
- Automatically set the **Primary Contact** to the selected Contact.  

This functionality could be implemented through enhancements to the **`AccountService`** and **`ContactService`**.

