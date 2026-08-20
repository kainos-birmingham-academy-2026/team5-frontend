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
  Scenario: Registered candidate signs in and signs out successfully
    Given a registered candidate account exists
    And I am on the sign in page
    When I sign in with valid credentials
    Then I am successfully signed in
    When I sign out
    Then I am returned to the sign in page

  @database
  Scenario: Unregistered candidate cannot sign in
    Given I am on the sign in page
    When I sign in with invalid credentials
    Then I am not signed in
