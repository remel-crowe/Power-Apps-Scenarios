// Main entry point for the script
this.formOnLoad = function (executionContext) {
  const primaryContactHandler = new PrimaryContactHandler(
    new DynamicsService(),
    new FormUtility()
  );
  primaryContactHandler.populatePrimaryContactDetails(executionContext);
};

function getCustomerType(customerId) {
  return customerId ? customerId[0].entityType : null;
}

/**
 * Utility class for interacting with Dynamics forms.
 */
class FormUtility {
  getCustomerId(formContext) {
    const customer = formContext.getAttribute("customerid").getValue();
    if (!customer) {
      return null;
    }
    return customer[0].id.replace(/[{}]/g, "");
  }

  setPrimaryContactField(formContext, contact) {
    formContext.getAttribute("primarycontactid").setValue([
      {
        id: contact.id,
        name: contact.name,
        entityType: "contact",
      },
    ]);
  }

  hidePrimaryContactField(formContext) {
    const field = formContext.getControl("primarycontactid");
    if (field) {
      field.setVisible(false);
    }
  }

  /**
   * Sets the required level for a field.
   * @param {Object} formContext - Dynamics form context.
   * @param {string} controlName - Field name.
   * @param {string} requiredLevel - Required level ("none", "required", "recommended").
   */
  setFieldRequiredLevel(formContext, controlName, requiredLevel) {
    const control = formContext.getAttribute(controlName);
    if (control) {
      control.setRequiredLevel(requiredLevel);
    }
  }
}

/**
 * Service class for interacting with Dynamics API.
 */
class DynamicsService {
  /**
   * Retrieves a record from Dynamics API.
   * @param {string} entityName - The name of the entity (e.g., "account").
   * @param {string} recordId - The ID of the record to retrieve.
   * @param {string} query - Query parameters for data selection.
   * @returns {Promise<Object>} - Retrieved record data.
   * @throws {Error} - Displays an alert if the request fails.
   */
  async retrieveRecord(entityName, recordId, query) {
    try {
      return await Xrm.WebApi.retrieveRecord(entityName, recordId, query);
    } catch (error) {
      console.error("Retrieve record failed:", error);
      Xrm.Utility.alertDialog(`Retrieve record failed: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Service class for handling account-related logic.
 */
class AccountService {
  /**
   * @param {DynamicsService} apiService - API service for interacting with Dynamics.
   */
  constructor(apiService) {
    this.apiService = apiService;
  }

  /**
   * Retrieves the primary contact ID for an account.
   * @param {string} accountId - Account ID.
   * @returns {Promise<string|null>} - Primary contact ID or null.
   */
  async getPrimaryContactId(accountId) {
    const account = await this.apiService.retrieveRecord(
      "account",
      accountId,
      "?$select=_primarycontactid_value"
    );
    return account._primarycontactid_value || null;
  }
}

/**
 * Service class for handling contact-related logic.
 */
class ContactService {
  /**
   * @param {DynamicsService} apiService - API service for interacting with Dynamics.
   */
  constructor(apiService) {
    this.apiService = apiService;
  }

  /**
   * Retrieves contact details by ID.
   * @param {string} customerId - Contact ID.
   * @returns {Promise<Object>} - Contact details.
   */
  async getContactDetails(customerId) {
    const contact = await this.apiService.retrieveRecord(
      "contact",
      customerId,
      "?$select=fullname"
    );
    return contact.fullname
      ? { id: customerId, name: contact.fullname }
      : { id: customerId };
  }
}

/**
 * Handler for primary contact logic.
 */
class PrimaryContactHandler {
  /**
   * Initializes services for account, contact, and customer type operations.
   * @param {DynamicsService} apiService - API service for interacting with Dynamics.
   * @param {FormUtility} formUtility - Utility for form interactions.
   */
  constructor(apiService, formUtility) {
    this.accountService = new AccountService(apiService);
    this.contactService = new ContactService(apiService);
    this.formUtility = formUtility;
  }

  /**
   * Populates the primary contact field based on customer type.
   * @param {Object} executionContext - Dynamics form execution context.
   */
  async populatePrimaryContactDetails(executionContext) {
    try {
      const formContext = executionContext.getFormContext();
      if (!formContext) throw new Error("Form context not found.");

      const customerId = this.formUtility.getCustomerId(formContext);
      if (!customerId) throw new Error("Customer ID not invalid/not found.");

      const customerType = getCustomerType(customerId);

      if (customerType === "account") {
        await this.handleAccountCustomer(formContext, customerId);
      } else {
        this.formUtility.hidePrimaryContactField(formContext);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      Xrm.Utility.alertDialog(`An error occurred: ${error.message}`);
    }
  }

  /**
   * Handles logic for customers of type "account."
   * @param {Object} formContext - Dynamics form context.
   * @param {string} customerId - Account ID.
   */
  async handleAccountCustomer(formContext, customerId) {
    this.formUtility.setFieldRequiredLevel(
      formContext,
      "primarycontactid",
      "required"
    );

    const primaryContactId = await this.accountService.getPrimaryContactId(
      customerId
    );

    if (!primaryContactId) {
      Xrm.Utility.alertDialog(
        "No primary contact associated with this account."
      );
      console.warn(`No primary contact found for account ID: ${customerId}`);
      return;
    }

    const primaryContactDetails = await this.contactService.getContactDetails(
      primaryContactId
    );
    this.formUtility.setPrimaryContactField(formContext, primaryContactDetails);
  }
}
