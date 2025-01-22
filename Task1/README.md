# Dynamics 365 Case Form Customisation

## Overview

This project enhances the Dynamics 365 Case form by implementing functionality to auto-populate the **Primary Contact** field. It uses a **object-oriented approach** with service layers to ensure scalability, maintainability, and testability. 

While a functional programming approach could have been utilised, feedback from Scenario 1 influenced the decision to adopt a class-based architecture to better adhere to **SOLID design principles**.

### Solution Structure

The solution is split into two scripts:

1. **Main Case Form Script:**  
   Manages primary logic related to the case form, including setting and validating the primary contact.  

2. **Quick View Management Script:**  
   Handles the behavior of the Quick View control, ensuring it displays relevant fields when the primary contact is set.  


## Key Components

### 1. **`DynamicsService`**  
A generic service for interacting with the Dynamics Web API.  

### 2. **`AccountService`**  
Handles account-related logic, such as retrieving a primary contact ID.  

### 3. **`ContactService`**  
Manages contact-related logic, including fetching contact details.  

### 4. **`CustomerTypeService`**  
Determines the type of customer (e.g., account or contact).  

### 5. **`PrimaryContactHandler`**  
Coordinates the various services to manage the **Primary Contact** functionality on the main Case form.  


## Alternative Approaches and Add-Ons

### 1. **Handle Missing Primary Contact for Accounts**  
If the customer is an **Account** without a primary contact, a control could be provided for users to input a contact email and/or phone number manually.  

### 2. **Relate Contacts to Accounts**  
If the customer is a **Contact** related to an Account, the solution could be extended to:  
- Automatically check the contact for a related account.  
- Set the related account as the new customer.  
- Set the primary contact as the contact.  

This functionality could be implemented through extensions of the **`AccountService`** and **`ContactService`** classes.  

---
