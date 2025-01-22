// Main entry point for the script
this.formOnLoad = function (executionContext) {
  const primaryContactHandler = new PrimaryContactHandler();
  primaryContactHandler.populatePrimaryContactDetails(executionContext);
};

// Service class for interacting with Dynamics API
class DynamicsService {
  async retrieveRecord(entityName, recordId, query) {
    try {
      return await Xrm.WebApi.retrieveRecord(entityName, recordId, query);
    } catch (error) {
      Xrm.Utility.alertDialog(`An error occurred: ${error.message}`);
    }
  }
}

// Service class for handling account-related logic
class AccountService {
  constructor(apiService) {
    this.apiService = apiService;
  }

  async getPrimaryContactId(accountId) {
    const account = await this.apiService.retrieveRecord(
      "account",
      accountId,
      "?$select=_primarycontactid_value"
    );
    return account._primarycontactid_value || null;
  }
}

// Service class for handling contact-related logic
class ContactService {
  constructor(apiService) {
    this.apiService = apiService;
  }

  async getContactDetails(customerId) {
    const contact = await this.apiService.retrieveRecord(
      "contact",
      customerId,
      "?$select=fullname"
    );
    return {
      id: customerId,
      name: contact.fullname,
    };
  }
}

// Service class for handling logic related to determining customer type
class CustomerTypeService {
  getCustomerType(customer) {
    return customer ? customer[0].entityType : null;
  }
}

// Handler for primary contact logic
class PrimaryContactHandler {
  constructor() {
    const apiService = new DynamicsService();
    this.accountService = new AccountService(apiService);
    this.contactService = new ContactService(apiService);
    this.customerTypeService = new CustomerTypeService();
  }

  async populatePrimaryContactDetails(executionContext) {
    try {
      const formContext = executionContext.getFormContext();
      const customerId = this.getCustomerId(formContext);
      const customerType = this.customerTypeService.getCustomerType(customerId);

      customerType === "account"
        ? this.handleAccountCustomer(formContext, customerId)
        : this.hidePrimaryContactField(formContext);
    } catch (error) {
      Xrm.Utility.alertDialog(`An error occurred: ${error.message}`);
    }
  }

  async handleAccountCustomer(formContext, customerId) {
    this.setFieldRequiredLevel(formContext, "primarycontactid", "required");
    const primaryContactId = await this.accountService.getPrimaryContactId(
      customerId
    );

    if (!primaryContactId) return;

    const primaryContactDetails = await this.contactService.getContactDetails(
      primaryContactId
    );
    this.setPrimaryContact(formContext, primaryContactDetails);
  }

  // Helper methods
  getCustomerId(formContext) {
    const customer = formContext.getAttribute("customerid").getValue();
    return customer ? customer[0].id.replace(/[{}]/g, "") : null;
  }

  setPrimaryContact(formContext, contact) {
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

  setFieldRequiredLevel(formContext, controlName, requiredLevel) {
    const control = formContext.getAttribute(controlName);
    if (control) {
      control.setRequiredLevel(requiredLevel);
    }
  }
}
