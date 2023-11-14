# Requirements Document - current EZWallet

Date:

Version: V1 - description of EZWallet in CURRENT form (as received by teachers)

| Version number | Change |
| -------------- | :----- |
| 1.0            |        |

# Contents

-   [Informal description](#informal-description)
-   [Stakeholders](#stakeholders)
-   [Context Diagram and interfaces](#context-diagram-and-interfaces)
    -   [Context Diagram](#context-diagram)
    -   [Interfaces](#interfaces)
-   [Stories and personas](#stories-and-personas)
-   [Functional and non functional requirements](#functional-and-non-functional-requirements)
    -   [Functional Requirements](#functional-requirements)
    -   [Non functional requirements](#non-functional-requirements)
-   [Use case diagram and use cases](#use-case-diagram-and-use-cases)

    -   [Use case diagram](#use-case-diagram)
    -   [Use cases](#use-cases)

        -   [Use case 1 Login , UC1](#use-case-1-login-uc1)
            -   [Scenario 1.1 Nominal](#scenario-11-nominal)
            -   [Scenario 1.3 Exception](#scenario-12-exception)
                -   [Scenario 1.1 Nominal](#scenario-11-nominal)
                -   [Scenario 1.2 Exception](#scenario-12-exception)
        -   [Use case 2 Logout, UC2](#use-case-2-logout-uc2)
            -   [Scenario 2.1 Nominal](#scenario-21-nominal)
            -   [Scenario 2.2 Variant](#scenario-22-variant)
            -   [Scenario 2.3 Exception](#scenario-23-exception)
                -   [Scenario 2.1 Nominal](#scenario-21-nominal)
                -   [Scenario 2.2 Exception](#scenario-22-exception)
        -   [Use case 3 Sign Up, UC3](#use-case-3-sing-up-uc3)

            -   [Scenario 3.1 Nominal](#scenario-31-nominal)
            -   [Scenario 3.2 Variants](#scenario-32-variants)
            -   [Scenario 3.3 Exception 1](#scenario-33-exception-1)
            -   [Scenario 3.4 Exception 2](#scenario-34-exception-2)
                -   [Scenario 3.1 Nominal](#scenario-31-nominal)
                -   [Scenario 3.2 Exception](#scenario-32-exception)

        -   [Use case 4 Show Users , UC4](#use-case-4-show-users-uc4)
            -   [Scenario 4.1 Nominal](#scenario-41-nominal)
            -   [Scenario 4.2 Variant 1](#scenario-42-variant-1)
            -   [Scenario 4.3 Variant 2](#scenario-43-variant-2)
                -   [Scenario 4.1 Nominal](#scenario-41-nominal)
                -   [Scenario 4.2 Exception](#scenario-42-exception)
        -   [Use case 5 Show User Info, UC5](#use-case-5-show-user-info-uc5)
            -   [Scenario 5.1 Nominal](#scenario-51-nominal)
            -   [Scenario 5.2 Exception 1](#scenario-52-exception-1)
            -   [Scenario 5.3 Exception 2](#scenario-53-exception-2)
        -   [Use Case 6 Add Transaction, UC6](#use-case-6-add-transaction-uc6)
            -   [Scenario 6.1 Nominal](#scenario-61-nominal)
        -   [Use Case 7 Delete Transaction, UC7](#use-case-7-delete-transaction-uc7)
            -   [Scenario 7.1 Nominal](#scenario-71-nominal)
            -   [Scenario 7.2 Exception](#scenario-72-exception)
        -   [Use Case 8 Get Transaction, UC8](#use-case-8-get-transaction-uc8)
            -   [Scenario 8.1 Nominal](#scenario-81-nominal)
            -   [Scenario 8.2 Variant](#scenario-82-variant)
        -   [Use Case 9 Create category, UC9](#use-case-9-create-category-uc9)
            -   [Scenario 9.1 Nominal](#scenario-91-nominal)

-   [Glossary](#glossary)
-   [System design](#system-design)
-   [Deployment diagram](#deployment-diagram)
-   [Table of defects](#table-of-defects)

# Informal description

EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.

# Stakeholders

| Stakeholder name       |                                                                                             Description                                                                                              |
| ---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| End User               |                                                                             People who use the app to make transactions                                                                              |
| Database Administrator |                                                                   People in charge of overseeing and managing the Mongo DB servers                                                                   |
| Star-up Company        |                    Company in charge of developing the software and providing the service. It is divided between a general administrator and a COO(Business developer) of the app                    |
| Competitors            | Other services such as the banks with integrated functions of transaction management on their apps (like the UniCredit app) and other services with this integrated function like PayPal and Revolut |

# Context Diagram and interfaces

## Context Diagram

![context diagram](assets/diagrams/Context_diagram.png)

## Interfaces

| Actor                  |                            Logical Interface                             |                                 Physical Interface |
| ---------------------- | :----------------------------------------------------------------------: | -------------------------------------------------: |
| User                   | GUI with key functions of user authentication and transaction management |                   Screen, mouse and Keyboard on PC |
| Administrator          |                  GUI with key functions of user search                   |                   Screen, mouse and Keyboard on PC |
| Database Administrator |                              Internet link                               | https://www.mongodb.com/docs/drivers/node/current/ |

# Stories and personas

#### Persona 1: Student, male, low income, 22 years old

This student living abroad, alone and with a limiting budget needs a way to track their expenses. They want to know how much money they spend on different categories such as groceries shopping, going out with friends, and home maintenance. By having one place to keep all their different types of purchases, the student can more easily track their expenses and avoid overspending. This can help them stay within their budget and avoid financial difficulties. Less time calculating his expenses opens more time for studing and a posibility of reducing his expenses in the future.

#### Persona 2: Family member, married, female, with children, 38 years old

A mother of two children is responsible for managing the household expenses, maintaining the children, and organizing the house. She needs a fast and easy way to track the money spent on the house, children, husband, and herself. The end goal is to avoid financial problems.

#### Persona 3: Organization representative, entreprenuer, male, 28 years old

An entrepreneur is creating a shop for selling sports equipment as a third party. He needs an easy way to track the shop expenses and equipment purchases. By having an easy way to follow his transactions and keep working on the shop, he can spend less on another worker to track this for him and ensure that his shop revenue is greater than his expenses.

# Functional and non functional requirements

## Functional Requirements

| ID    |                 Description                 |
| ----- | :-----------------------------------------: |
| FR1   |             Manage Transactions             |
| FR1.1 |   Add Transaction (title, cost, category)   |
| FR1.2 |             Delete Transaction              |
| FR1.2 |         Create transaction Category         |
| FR2   |                Show Expenses                |
| FR3   |                Manage users                 |
| FR3.1 | create user account (name, email, password) |
| FR3.2 |           Registration and login            |
| FR3.3 |                  Authorise                  |

## Non Functional Requirements

| ID   | Type (efficiency, reliability, ..) |                                                                                                  Description                                                                                                   | Refers to |
| ---- | :--------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | --------: |
| NFR1 |            availability            |               The application should have a response time of less than 2 seconds for each user action, and be able to handle at least 1000 simultaneous users without slowing down or crashing.                |    All FR |
| NFR2 |            Reliability             | The application must be available and functioning properly at all times, with minimal downtime or disruptions. It should have a robust backup and recovery system in place to prevent data loss or corruption. |    All FR |
| NFR3 |            Scalability             |                                   The application should be able to handle a 50% increase in user traffic within 24 hours, without impacting its performance or reliability.                                   |   FR2/FR3 |
| NFR4 |             Usability              |                         The application should have a usability score of at least 80% on a standardized usability test, and provide clear and concise help and support documentation.                          |       FR2 |
| NFR5 |              Security              |  The application should have a penetration test score of at least 80%, indicating that it has strong security features and is protected against common attacks such as SQL injection or cross-site scripting.  |       FR3 |
| NFR5 |          Maintainability           |                                  The application should have a code coverage of at least 80%, indicating that it has well-documented code and is easy to maintain and update.                                  |    All FR |

# Use case diagram and use cases

## Use case diagram

![Use case diagram](assets/diagrams/UseCaseDiagramV1.png)

### Use case 1 Login, UC1

| Actors Involved  |                                                                                   |
| ---------------- | :-------------------------------------------------------------------------------: |
| Precondition     |                                User has an account                                |
| Post condition   |                               User is authenticated                               |
| Nominal Scenario |     User enters his data correctly authenticated and gains access to web page     |
| Variants         | User administrator enters his data correctly and is authenticated on the web page |
| Exceptions       |                    Login data in inserted incorrectly by user                     |

##### Scenario 1.1 Nominal and variant

| Scenario 1.1   |                                                         |
| -------------- | :-----------------------------------------------------: |
| Precondition   |    User has an account and logged in data is correct    |
| Post condition | User is authenticated and logged into his personal page |
| Step#          |                       Description                       |
| 1              |                   User ask to log in                    |
| 2              |           System asks for email and password            |
| 3              |             User inserts email and password             |
| 4              |          Systems checks the email and password          |
| 5              |                  User is authenticated                  |

##### Scenario 1.2 Exception

| Scenario 1.2   |                                                     |
| -------------- | :-------------------------------------------------: |
| Precondition   | User has an account and logged in data is incorrect |
| Post condition |              User is not authenticated              |
| Step#          |                     Description                     |
| 1              |                 User ask to log in                  |
| 2              |         System asks for email and password          |
| 3              |           User inserts email and password           |
| 4              |        Systems checks the email and password        |
| 5              |  System show an error message 'wrong credentials'   |
| 6              |              User is not authenticated              |

### Use case 2 Logout, UC2

| Actors Involved  |                                                             |
| ---------------- | :---------------------------------------------------------: |
| Precondition     |                      User is logged in                      |
| Post condition   |                     User is logged out                      |
| Nominal Scenario |          User asks to log out and it is logged out          |
| Exceptions       | Authentication token are not found and user can not log out |

##### Scenario 2.1 Nominal

| Scenario 2.1   |                               |
| -------------- | :---------------------------: |
| Precondition   |       User is logged in       |
| Post condition |      User is logged out       |
| Step#          |          Description          |
| 1              |    User ask to be log out     |
| 2              | System verifies refresh token |
| 3              |     System logs out user      |

##### Scenario 2.2 Exception

| Scenario 2.2   |                                                 |
| -------------- | :---------------------------------------------: |
| Precondition   |                User is logged in                |
| Post condition | User is not logged out or is already logged out |
| Step#          |                   Description                   |
| 1              |             User ask to be log out              |
| 2              |          System verifies refresh token          |
| 3              |          System provides error message          |
| 4              |             User is not logged out              |

### Use case 3 Sign Up, UC3

| Actors Involved  |                                                                                 |
| ---------------- | :-----------------------------------------------------------------------------: |
| Precondition     |                         User has not created a account                          |
| Post condition   |                               account is created                                |
| Nominal Scenario | User provides information of email, username and password and creates a account |
| Exception        |               Account is already created or email is already used               |

##### Scenario 3.1 Nominal

| Scenario 3.1   |                                                                   |
| -------------- | :---------------------------------------------------------------: |
| Precondition   |                  User has not created a account                   |
| Post condition |                        account is created                         |
| Step#          |                            Description                            |
| 1              |                   User ask to create a account                    |
| 2              |            User provides email, username and password             |
| 3              | Systems verifies the information provided does not already exists |
| 4              |                        Account is created                         |

##### Scenario 3.2 Exception

| Scenario 3.2   |                                                                   |
| -------------- | :---------------------------------------------------------------: |
| Precondition   |                    User has created a account                     |
| Post condition |                      account is not created                       |
| Step#          |                            Description                            |
| 1              |                   User ask to create a account                    |
| 2              |            User provides email, username and password             |
| 3              | Systems verifies the information provided does not already exists |
| 4              |  Systems provides an error message "you are already registered"   |
| 4              |             Account already exists and is not created             |

### Use case 4 Show Users, UC4

| Actors Involved  |                                                          |
| ---------------- | :------------------------------------------------------: |
| Precondition     |         User is logged in and is a administrator         |
| Post condition   |                System provides users list                |
| Nominal Scenario | User is an administrator and asks to shoy the users list |
| Exceptions       |               User is not an adminsitrator               |

##### Scenario 4.1 Nominal

| Scenario 4.1   |                                           |
| -------------- | :---------------------------------------: |
| Precondition   | User is logged in and is an administrator |
| Post condition |        System provides users list         |
| Step#          |                Description                |
| 1              |     Admin user ask for the user list      |
| 2              | System checks if user is a administrator  |
| 3              |       System gives back users list        |

##### Scenario 4.2 Exception

| Scenario 4.2   |                                               |
| -------------- | :-------------------------------------------: |
| Precondition   | User is logged in and is not an administrator |
| Post condition |        Systems does not give back list        |
| Step#          |                  Description                  |
| 1              |       Admin user ask for the user list        |
| 2              |   System checks if user is a administrator    |
| 3              | Systems gives back an error of not authorized |

### Use case 5 Show User Info, UC5

| Actors Involved  |                                                                |
| ---------------- | :------------------------------------------------------------: |
| Precondition     |                       User is logged in                        |
| Post condition   |           System gives back logged user information            |
| Nominal Scenario | User asks for its own information and the system gives it back |
| Exception 1      |                    Username does not exist                     |
| Exception 2      |          Username does not correspond to logged user           |

##### Scenario 5.1 Nominal

| Scenario 5.1   |                                           |
| -------------- | :---------------------------------------: |
| Precondition   |             User is logged in             |
| Post condition | System gives back logged user information |
| Step#          |                Description                |
| 1              |      User provides his own username       |
| 2              |      System checks for refresh token      |
| 3              |        System gives back user info        |

##### Scenario 5.2 Exception 1

| Scenario 5.2   |                                                      |
| -------------- | :--------------------------------------------------: |
| Precondition   |                  User is logged in                   |
| Post condition |  System does not give back logged user information   |
| Step#          |                     Description                      |
| 1              |            User provides his own username            |
| 2              |           System checks for refresh token            |
| 3              | System gives back an error message of user not found |

##### Scenario 5.3 Exception 2

| Scenario 5.3   |                                                           |
| -------------- | :-------------------------------------------------------: |
| Precondition   |                     User is logged in                     |
| Post condition |     System does not give back logged user information     |
| Step#          |                        Description                        |
| 1              |              User provides his own username               |
| 2              |              System checks for refresh token              |
| 3              | System gives back an error message of user not authorized |

### Use case 6 Add Transaction, UC6

| Actors Involved  |                                                                               |
| ---------------- | :---------------------------------------------------------------------------: |
| Precondition     |                               User is logged in                               |
| Post condition   |                            Transaction is created                             |
| Nominal Scenario | User provides information of name, amount and type and transaction is created |

##### Scenario 6.1 Nominal

| Scenario 6.1   |                                   |
| -------------- | :-------------------------------: |
| Precondition   |         User is logged in         |
| Post condition |      Transaction is created       |
| Step#          |            Description            |
| 1              | User asks to create a transaction |
| 2              | User inputs name, amount and type |
| 3              |      Transaction is created       |

### Use case 7 Delete Transaction, UC7

| Actors Involved  |                                                                |
| ---------------- | :------------------------------------------------------------: |
| Precondition     |                       User is logged in                        |
| Post condition   |                     Transaction is deleted                     |
| Nominal Scenario | User provides id of transaction and the transaction is deleted |
| Exceptions       |                  Transaction id is not found                   |

##### Scenario 7.1 Nominal

| Scenario 7.1   |                                   |
| -------------- | :-------------------------------: |
| Precondition   |         User is logged in         |
| Post condition |      Transaction is deleted       |
| Step#          |            Description            |
| 1              | User asks to delete a transaction |
| 2              |   User provides transaction id    |
| 3              |       Systems looks for id        |
| 4              |      Transaction id deleted       |

##### Scenario 7.2 Exception

| Scenario 7.2   |                                                           |
| -------------- | :-------------------------------------------------------: |
| Precondition   |                     User is logged in                     |
| Post condition |                Transaction is not deleted                 |
| Step#          |                        Description                        |
| 1              |             User asks to delete a transaction             |
| 2              |               User provides transaction id                |
| 3              |                   Systems looks for id                    |
| 4              | Systems gives back error message of transaction not found |

### Use case 8 Get transaction, UC8

| Actors Involved  |                                                                                  |
| ---------------- | :------------------------------------------------------------------------------: |
| Precondition     |                                User is logged in                                 |
| Post condition   |                        System gives back transaction list                        |
| Nominal Scenario |          User asks for his transactions list and the systems provide it          |
| Variant          | User asks for transaction list on a specific category and The system provides it |

##### Scenario 8.1 Nominal

| Scenario 8.1   |                                     |
| -------------- | :---------------------------------: |
| Precondition   |          User is logged in          |
| Post condition | System gives back transaction list  |
| Step#          |             Description             |
| 1              |   User asks for transaction list    |
| 2              | Systems gives back transaction list |

##### Scenario 8.2 Variant

| Scenario 8.2   |                                                          |
| -------------- | :------------------------------------------------------: |
| Precondition   |                    User is logged in                     |
| Post condition |            System gives back transaction list            |
| Step#          |                       Description                        |
| 1              | User asks for transaction list with a especific category |
| 2              |           Systems gives back transaction list            |

### Use case 9 Create category, UC9

| Actors Involved  |                                                                             |
| ---------------- | :-------------------------------------------------------------------------: |
| Precondition     |                              User is logged in                              |
| Post condition   |                     System adds new category to server                      |
| Nominal Scenario | User clicks on a button when adding a new transaction to add a new category |

##### Scenario 9.1 Nominal

| Scenario 9.1   |                                            |
| -------------- | :----------------------------------------: |
| Precondition   |             User is logged in              |
| Post condition |     System adds new category to server     |
| Step#          |                Description                 |
| 1              | User clicks a button to create transaction |
| 2              |     User clicks on create new category     |
| 3              |    Systems adds new category to server     |

..

# Glossary

![Glossary diagram](assets/diagrams/Glossary.png)

# System Design

![system design diagram](assets/diagrams/system_design.png)

# Deployment Diagram

![Deployment diagram](assets/diagrams/deployment_diagram.png)

# Table of Defects

| Defects                                       |                                                                                                           Description                                                                                                            |
| --------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Admin is not well defined                     | There is no acutal distinction betweeen admin and normal users. The possibility to become an admin is not specified and there are functions, which should be accessible to admin only, but they are callable by any type of user |
| Non existing category when adding transaction |         When a transaction is being added there is no actual check on the inserted type(category). In this way whenever the method get_labels is called the newly inserted transaction will be returned without a label          |
| Coding bug in get_labels                      |                                             On the object returned by the method the color attribute does not actually hold the color of the category but the category object itself                                             |
