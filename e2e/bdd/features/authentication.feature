Feature: Candidate authentication

  Candidates create an account, sign in to the careers site and sign out again.

  Scenario: The sign in form is rendered
    Given I am on the sign in page
    Then the sign in form is shown

  Scenario: Moving between the sign in and register pages
    Given I am on the sign in page
    When I follow the link to create an account
    Then the register page is shown
    When I follow the link to sign in
    Then the sign in page is shown

  Scenario: The password checklist reacts to the password strength
    Given I am on the register page
    When I type the password "Ab!1"
    Then the password rules are not satisfied:
      | length |
    When I type a valid password
    Then the password rules are satisfied:
      | length    |
      | uppercase |
      | lowercase |
      | special   |

  @database
  Scenario: A new candidate registers and is signed in
    Given I am on the register page
    When I register with a new email address and a valid password
    Then the careers home page is shown
    And I see the confirmation "Account successfully created."
    And I am signed in

  @database
  Scenario: An existing candidate signs in and out again
    Given a registered candidate account exists
    And I am on the sign in page
    When I sign in with the registered credentials
    Then the careers home page is shown
    And I am signed in
    When I sign out
    Then the sign in page is shown
    And I am signed out

  @database
  Scenario: Invalid credentials are rejected
    Given I am on the sign in page
    When I sign in with credentials that do not exist
    Then I see the error "Email or password is incorrect"

  @database
  Scenario: Submitting the login form succeeds
    Given a registered candidate account exists
    And I am on the sign in page
    When I submit the login form with the registered credentials
    Then the login form is submitted successfully with status 302
    And the careers home page is shown

  @database
  Scenario: Submitting the login form is rejected
    Given I am on the sign in page
    When I submit the login form with credentials that do not exist
    Then the login form submission is rejected with status 401
    And an error message is shown
