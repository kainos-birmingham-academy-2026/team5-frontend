Feature: Job Roles Viewing

    Applicants Navigate to Job Roles page, filter through and open details.

    @database
    Scenario: The Job Roles list is rendered
        Given User is on job roles page
        Then job roles are shown

    @database
    Scenario: Moving from Job Roles list to Job Roles details page
        Given User is on job roles page
        When User clicks on a job role
        Then job role detail page is shown

    @database
    Scenario: Ordering the Job Roles list by a column
        Given User is on job roles page
        When User clicks the "roleName" column heading
        Then the "roleName" column is ordered "asc"
        When User clicks the "roleName" column heading
        Then the "roleName" column is ordered "desc"
        When User clicks the "roleName" column heading
        Then the "roleName" column is ordered "none"
