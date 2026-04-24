Feature: Invoice CSV export

  Background:
    Given the account has the fixture invoices loaded from "fixtures/three-invoices.json"

  Scenario: SPEC-0001-R01 finance user exports CSV successfully
    Given a user with role "finance"
    When the user calls GET /invoices/export
    Then the response status is 200
    And the response content-type is "text/csv"
    And the response body matches "expected/three-invoices.csv"

  Scenario: SPEC-0001-R02 CSV contains exact columns in order
    Given a user with role "finance"
    When the user calls GET /invoices/export
    Then the first CSV line is "id,issue_date,customer_name,amount,currency,status"

  Scenario: SPEC-0001-R03 non-finance user is denied
    Given a user with role "viewer"
    When the user calls GET /invoices/export
    Then the response status is 403
    And the response body does not contain any invoice id

  Scenario: SPEC-0001-R04 amounts formatted with two decimals and no thousands separator
    Given a user with role "finance"
    When the user calls GET /invoices/export
    Then every amount in the CSV matches the pattern "^[0-9]+\\.[0-9]{2}$"

  Scenario: SPEC-0001-R05 rate limit triggers after 10 requests per minute
    Given a user with role "finance"
    When the user calls GET /invoices/export 11 times within 60 seconds
    Then the 11th response status is 429
    And the response header "Retry-After" is an integer

  Scenario: SPEC-0001-R06 export never exposes customer_email
    Given a user with role "finance"
    When the user calls GET /invoices/export
    Then the CSV header line does not contain "customer_email"
    And no CSV row contains an "@" character
