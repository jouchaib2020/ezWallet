# Requirements Document - future EZWallet

Date:

Version: V2 - description of EZWallet in FUTURE form (as proposed by the team)

| Version number | Change |
| -------------- | :----- |
| 2.0            |        |

# Contents

- [Informal description](#informal-description)
- [Business Model](#business-model)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)

  - [Use case diagram](#use-case-diagram)
  - [Use cases](#use-cases)

    - [Use case 1 Login , UC1](#use-case-1-login-uc1)
      - [Scenario 1.1 Nominal](#scenario-11-nominal)
      - [Scenario 1.3 Exception](#scenario-12-exception)
        - [Scenario 1.1 Nominal](#scenario-11-nominal)
        - [Scenario 1.2 Exception](#scenario-12-exception)
    - [Use case 2 Logout, UC2](#use-case-2-logout-uc2)
      - [Scenario 2.1 Nominal](#scenario-21-nominal)
      - [Scenario 2.2 Variant](#scenario-22-variant)
      - [Scenario 2.3 Exception](#scenario-23-exception)
        - [Scenario 2.1 Nominal](#scenario-21-nominal)
        - [Scenario 2.2 Exception](#scenario-22-exception)
    - [Use case 3 Sign Up, UC3](#use-case-3-sing-up-uc3)

      - [Scenario 3.1 Nominal](#scenario-31-nominal)
      - [Scenario 3.2 Variants](#scenario-32-variants)
      - [Scenario 3.3 Exception 1](#scenario-33-exception-1)
      - [Scenario 3.4 Exception 2](#scenario-34-exception-2)
        - [Scenario 3.1 Nominal](#scenario-31-nominal)
        - [Scenario 3.2 Exception](#scenario-32-exception)

    - [Use case 4 Show Users , UC4](#use-case-4-show-users-uc4)
      - [Scenario 4.1 Nominal](#scenario-41-nominal)
      - [Scenario 4.2 Variant 1](#scenario-42-variant-1)
      - [Scenario 4.3 Variant 2](#scenario-43-variant-2)
        - [Scenario 4.1 Nominal](#scenario-41-nominal)
        - [Scenario 4.2 Exception](#scenario-42-exception)
    - [Use case 5 Show User Info, UC5](#use-case-5-show-user-info-uc5)
      - [Scenario 5.1 Nominal](#scenario-51-nominal)
      - [Scenario 5.2 Exception 1](#scenario-52-exception-1)
      - [Scenario 5.3 Exception 2](#scenario-53-exception-2)
    - [Use Case 6 Add Transaction, UC6](#use-case-6-add-transaction-uc6)
      - [Scenario 6.1 Nominal](#scenario-61-nominal)
    - [Use Case 7 Delete Transaction, UC7](#use-case-7-delete-transaction-uc7)
      - [Scenario 7.1 Nominal](#scenario-71-nominal)
      - [Scenario 7.2 Exception](#scenario-72-exception)
    - [Use Case 8 Get Transaction, UC8](#use-case-8-get-transaction-uc8)
      - [Scenario 8.1 Nominal](#scenario-81-nominal)
      - [Scenario 8.2 Variant](#scenario-82-variant)
    - [Use Case 9 Show Statistics, UC9](#use-case-9-show-statistics-uc9)
      - [Scenario 9.1 Nominal](#scenario-91-nominal)
      - [Scenario 9.2 Variant](#scenario-92-variant)
    - [Use Case 10 Add friends, UC10](#use-case-10-add-friends-uc10)
      - [Scenario 10.1 Nominal](#scenario-101-nominal)
      - [Scenario 10.2 Exception](#scenario-102-exception)
    - [Use Case 11 Manage friends invitations, UC11](#use-case-11-manage-friends-invitations-uc11)
      - [Scenario 11.1 Nominal](#scenario-111-nominal)
      - [Scenario 11.2 Variant](#scenario-112-variant)
    - [Use Case 12 Remove friend, UC12](#use-case-12-remove-friend-uc12)
      - [Scenario 12.1 Nominal](#scenario-121-nominal)
    - [Use Case 13 Create Group, UC13](#use-case-13-create-group-uc13)
      - [Scenario 13.1 Nominal](#scenario-131-nominal)
      - [Scenario 13.2 Variant](#scenario-132-variant)
    - [Use Case 14 Add friends to group, UC14](#use-case-14-add-friends-to-group-uc14)
      - [Scenario 14.1 Nominal](#scenario-141-nominal)
      - [Scenario 14.2 Exception](#scenario-142-exception)
    - [Use Case 15 Exit from group, UC15](#use-case-15-exit-from-group-uc15)
      - [Scenario 15.1 Nominal](#scenario-151-nominal)
    - [Use Case 16 Add Transactions to group, UC16](#use-case-16-add-transactions-to-group-uc16)
      - [Scenario 16.1 Nominal](#scenario-161-nominal)
    - [Use Case 17 Delete Group Transaction, UC17](#use-case-17-delete-group-transaction-uc17)
      - [Scenario 17.1 Nominal](#scenario-171-nominal)
    - [Use Case 18 Get group transactions, UC18](#use-case-18-get-group-transactions-uc18)
      - [Scenario 18.1 Nominal](#scenario-181-nominal)
      - [Scenario 18.2 Variant](#scenario-182-variant)
    - [Use Case 19 Connect with a bank, UC19](#use-case-19-connect-with-a-bank-uc19)
      - [Scenario 19.1 Nominal](#scenario-191-nominal)
      - [Scenario 19.2 Exception 1](#scenario-192-exception-1)
      - [Scenario 19.3 Exception 2](#scenario-193-exception-2)
    - [Use Case 20 Change password, UC20](#use-case-20-change-password-uc20)
      - [Scenario 20.1 Nominal](#scenario-201-nominal)
      - [Scenario 20.2 Variant](#scenario-202-exception)
    - [Use Case 21 Crate category, UC21](#use-case-21-create-category-uc21)
      - [Scenario 21.1 Nominal](#scenario-91-nominal)

- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)
- [Table of solved defects](#table-of-solved-defects)

# Informal description

EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.

# Business Model

Service is offered for free and developed by a private company, but users must watch ads provided by Google Ads.

# Stakeholders

| Stakeholder name       |                                                                                             Description                                                                                              |
| ---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| End User               |                                                                             People who use the app to make transactions                                                                              |
| Database Administrator |                                                                   People in charge of overseeing and managing the Mongo DB servers                                                                   |
| Star-up Company        |                    Company in charge of developing the software and providing the service. It is divided between a general administrator and a COO(Business developer) of the app                    |
| Google Play            |                                                 The android app well meet legal and quality requirements of google play and well be published in it                                                  |
| Apple store            |                                            The IOS version of the app well meet legal and quality requirements of Apple store and well be published in it                                            |
| Competitors            | Other services such as the banks with integrated functions of transaction management on their apps (like the UniCredit app) and other services with this integrated function like PayPal and Revolut |
| Banks                  |                                                        Banks that share their data with EzWallet for integration of tracking of transactions                                                         |
| Google Ads             |                                                                                      Ads provided by Google API                                                                                      |

# Context Diagram and interfaces

## Context Diagram

![context diagram](assets/diagrams/Context_diagramV2.png)

## Interfaces

| Actor                  |                            Logical Interface                             |                                      Physical Interface |
| ---------------------- | :----------------------------------------------------------------------: | ------------------------------------------------------: |
| User                   | GUI with key functions of user authentication and transaction management |                        Screen, mouse and Keyboard on PC |
| Administrator          |                  GUI with key functions of user search                   |                        Screen, mouse and Keyboard on PC |
| Database Administrator |                              Internet link                               |      https://www.mongodb.com/docs/drivers/node/current/ |
| Banks                  |                              Internet Link                               |                        Screen, mouse and Keyboard on PC |
| Google Ads             |                              Internet Link                               | https://developers.google.com/google-ads/api/docs/start |

# Stories and personas

#### Persona 1: Student, male, low income, 22 years old

This student living abroad, alone and with a limiting budget needs a way to track their expenses. They want to know how much money they spend on different categories such as groceries shopping, going out with friends, and home maintenance. By having one place to keep all their different types of purchases, the student can more easily track their expenses and avoid overspending. This can help them stay within their budget and avoid financial difficulties. Less time calculating his expenses opens more time for studing and a posibility of reducing his expenses in the future.

#### Persona 2: Family member, married, female, with children, 38 years old

A mother of two children is responsible for managing the household expenses, maintaining the children, and organizing the house. She needs a fast and easy way to track the money spent on the house, children, husband, and herself. The end goal is to avoid financial problems. She can use the app with her husband and his children to gather information about transactions across all family members and learn at any point in time how much was spent.

#### Persona 3: Organization representative, entreprenuer, male, 28 years old

An entrepreneur is creating a shop for selling sports equipment as a third party. He needs an easy way to track the shop expenses and equipment purchases. By having an easy way to follow his transactions and keep working on the shop, he can spend less on another worker to track this for him and ensure that his shop revenue is greater than his expenses.

#### Persona 4: Individual on a friends trip, female, low income, 24 years old

This person and their friends require a method to monitor expenses during a trip within a specific time frame. They need a way to adhere to a budget and determine which individual spent money on behalf of the group for settling debts later.

# Functional and non functional requirements

## Functional Requirements

| ID    |                                Description                                 |
| ----- | :------------------------------------------------------------------------: |
| FR1   |                            Manage Transactions                             |
| FR1.1 |    Allow users to add Transactions (title, cost, category,date, method)    |
| FR1.2 |             Allow users to Delete one or multiple Transactions             |
| FR1.3 |         Auto-add users expenses registrated on their bank account          |
| FR2   |                             Show Transactions                              |
| FR2.1 |        allow users to filter transactions by : name, Category, date        |
| FR3   |                                Manage users                                |
| FR3.1 |                 CRUD user account (name, email, password)                  |
| FR3.2 |          Allow users to link their account to their bank account           |
| FR3.3 |                           Registration and login                           |
| FR3.4 |                               Authorization                                |
| FR4   |                  Allow admin to see registrated accounts                   |
| FR5   |                               Manage Friends                               |
| FR5.1 |                    Allow users to send friend requests                     |
| FR5.2 |                Allow users to accept/reject friend requests                |
| FR5.3 |                       Allow users to remove friends                        |
| FR6   |                               Manage Groups                                |
| FR6.1 |                Allow users to create groups (Title, Budget)                |
| FR6.2 |                 Allow users to add friends to thier groups                 |
| FR5.3 |            Allow users to join groups via other methods( links)            |
| FR7   |                             Manage budgetting                              |
| FR7.1 |             Allow users to define a budget for their expenses              |
| FR7.2 |          Allow users to define a budget for their group expenses           |
| FR8   |                            Manage Notifications                            |
| FR8.1 |        Send users real-time notifications of their account activity        |
| FR8.2 |               send users alerts when exceeding thier budgets               |
| FR9   |                              Show statistics                               |
| FR9.1 |             Allow users to see staistics about their expenses              |
| FR9.2 | Allow users to see staistics about filtered expenses(by date, category...) |

## Non Functional Requirements

| ID   | Type (efficiency, reliability, ..) |                                                                                                  Description                                                                                                   | Refers to |
| ---- | :--------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | --------: | --- | --- |
| NFR1 |            availability            |               The application should have a response time of less than 2 seconds for each user action, and be able to handle at least 10000 simultaneous users without slowing down or crashing.               |    All FR |
| NFR2 |            Reliability             | The application must be available and functioning properly at all times, with minimal downtime or disruptions. It should have a robust backup and recovery system in place to prevent data loss or corruption. |    All FR |
| NFR3 |            Scalability             |                                  The application should be able to handle a 100% increase in user traffic within 24 hours, without impacting its performance or reliability.                                   |   FR2/FR3 |
| NFR4 |             Usability              |                         The application should have a usability score of at least 80% on a standardized usability test, and provide clear and concise help and support documentation.                          |       FR2 |
| NFR5 |              Security              |  The application should have a penetration test score of at least 80%, indicating that it has strong security features and is protected against common attacks such as SQL injection or cross-site scripting.  |       FR3 |
| NFR5 |          Maintainability           |                                  The application should have a code coverage of at least 80%, indicating that it has well-documented code and is easy to maintain and update.                                  |    All FR |     |     |

# Use case diagram and use cases

## Use case diagram

![Use case diagram](assets/diagrams/UseCaseDiagramV2.png)

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
| Exception        |        Account is already created or username or email are already used         |

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

| Actors Involved  |                                                                                     |
| ---------------- | :---------------------------------------------------------------------------------: |
| Precondition     |                                  User is logged in                                  |
| Post condition   |                               Transaction is created                                |
| Nominal Scenario | User provides information of name, amount, date and type and transaction is created |

##### Scenario 6.1 Nominal

| Scenario 6.1   |                                         |
| -------------- | :-------------------------------------: |
| Precondition   |            User is logged in            |
| Post condition |         Transaction is created          |
| Step#          |               Description               |
| 1              |    User asks to create a transaction    |
| 2              | User inputs name, amount, date and type |
| 3              |         Transaction is created          |

### Use case 7 Delete Transaction, UC7

| Actors Involved  |                                                              |
| ---------------- | :----------------------------------------------------------: |
| Precondition     |                      User is logged in                       |
| Post condition   |                    Transaction is deleted                    |
| Nominal Scenario | User provides id or ids of transactions and they are deleted |
| Exceptions       |                 Transaction id is not found                  |

##### Scenario 7.1 Nominal

| Scenario 7.1   |                                         |
| -------------- | :-------------------------------------: |
| Precondition   |            User is logged in            |
| Post condition | Transaction or transactions are deleted |
| Step#          |               Description               |
| 1              |    User asks to delete a transaction    |
| 2              |     User provides transactions ids      |
| 3              |          Systems looks for ids          |
| 4              |        Transactions are deleted         |

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

| Actors Involved  |                                                                                          |
| ---------------- | :--------------------------------------------------------------------------------------: |
| Precondition     |                                    User is logged in                                     |
| Post condition   |                            System gives back transaction list                            |
| Nominal Scenario |              User asks for his transactions list and the systems provide it              |
| Variant          | User asks for transaction list on a specific category or date and The system provides it |

##### Scenario 8.1 Nominal

| Scenario 8.1   |                                     |
| -------------- | :---------------------------------: |
| Precondition   |          User is logged in          |
| Post condition | System gives back transaction list  |
| Step#          |             Description             |
| 1              |   User asks for transaction list    |
| 2              | Systems gives back transaction list |

##### Scenario 8.2 Variant

| Scenario 8.2   |                                                                  |
| -------------- | :--------------------------------------------------------------: |
| Precondition   |                        User is logged in                         |
| Post condition |                System gives back transaction list                |
| Step#          |                           Description                            |
| 1              | User asks for transaction list with a especific category or date |
| 2              |               Systems gives back transaction list                |

### Use case 9 Show statistics, UC9

| Actors Involved  |                                                                                 |
| ---------------- | :-----------------------------------------------------------------------------: |
| Precondition     |                                User is logged in                                |
| Post condition   |                    Systems provides statics of transactions                     |
| Nominal Scenario | User enters statistics tab on the application and the system provides them back |
| Variant          |     User enters statistics tab and provides filter of date and/or category      |

##### Scenario 9.1 Nominal

| Scenario 9.1   |                                                                       |
| -------------- | :-------------------------------------------------------------------: |
| Precondition   |                           User is logged in                           |
| Post condition |                         Statistics are shown                          |
| Step#          |                              Description                              |
| 1              |                      User enters statistics tab                       |
| 2              |        Systems calculates statistics with user's transactions         |
| 3              | Systems shows pie chart of transactions categories and total expenses |

##### Scenario 9.2 Variant

| Scenario 9.1   |                                                                 |
| -------------- | :-------------------------------------------------------------: |
| Precondition   |                        User is logged in                        |
| Post condition |                      Statistics are shown                       |
| Step#          |                           Description                           |
| 1              |                   User enters statistics tab                    |
| 2              |     User enters date and/or category that wants to be shown     |
| 2              |     Systems calculates statistics with user's transactions      |
| 3              | Systems shows pie chart of transactions categories and expenses |

### Use case 10 Add Friends , UC10

| Actors Involved  |                                                                                 |
| ---------------- | :-----------------------------------------------------------------------------: |
| Precondition     |                                User is logged in                                |
| Post condition   |                       User sends friend/connection invite                       |
| Nominal Scenario | User enter email or username of other user and invites him to connect with them |
| Exception        |                         Username or email do not exist                          |

##### Scenario 10.1 Nominal

| Scenario 10.1  |                                                                                          |
| -------------- | :--------------------------------------------------------------------------------------: |
| Precondition   |                                    User is logged in                                     |
| Post condition |                           User sends friend/connection invite                            |
| Step#          |                                       Description                                        |
| 1              |                                 User enters friends page                                 |
| 2              |                             User clicks on add friend button                             |
| 3              | User enters username or email of desire user connection and a optional greetings message |
| 4              |                      System checks if the email or username exists                       |
| 5              |                                  Friend invite is sent                                   |

##### Scenario 10.2 Exception

| Scenario 10.2  |                                                                                          |
| -------------- | :--------------------------------------------------------------------------------------: |
| Precondition   |                                    User is logged in                                     |
| Post condition |                        User do not send friend/connection invite                         |
| Step#          |                                       Description                                        |
| 1              |                                 User enters friends tab                                  |
| 2              |                             User clicks on add friend button                             |
| 3              | User enters username or email of desire user connection and a optional greetings message |
| 4              |                      System checks if the email or username exists                       |
| 5              |                        Systems provides error of "user not found"                        |

### Use case 11 Manage friends invitations , UC11

| Actors Involved  |                                                                                             |
| ---------------- | :-----------------------------------------------------------------------------------------: |
| Precondition     |                              User has recieve a friend invite                               |
| Post condition   |                          User accepts or denies friend connection                           |
| Nominal Scenario | User recieves friend invitation, accepts the connection and friend is added to friends list |
| Variant          |           User recieves friend invitation, denies it and notification is errased            |

##### Scenario 11.1 Nominal

| Scenario 11.1  |                                                                       |
| -------------- | :-------------------------------------------------------------------: |
| Precondition   |                   User has recieve a friend invite                    |
| Post condition |                    User accepts friend connection                     |
| Step#          |                              Description                              |
| 1              |                       User enters friends page                        |
| 2              |                       User enters requests page                       |
| 3              |                     User clicks on accept button                      |
| 4              |                     Systems errases notification                      |
| 5              |           System adds requesting user to user friends list            |
| 6              | Systems adds user information is added to connected user friends list |

##### Scenario 11.2 Variant

| Scenario 11.2  |                                  |
| -------------- | :------------------------------: |
| Precondition   | User has recieve a friend invite |
| Post condition |  User denies friend connection   |
| Step#          |           Description            |
| 1              |     User enters friends tab      |
| 2              |     User enters requests tab     |
| 3              |   User clicks on denie button    |
| 4              |   Systems errases notification   |

### Use case 12 Remove Friend, UC12

| Actors Involved  |                                                              |
| ---------------- | :----------------------------------------------------------: |
| Precondition     |               User has friends on friends list               |
| Post condition   |                User removes friend connection                |
| Nominal Scenario | User wants to stop a connection and removes friend from list |

##### Scenario 12.1 Nominal

| Scenario 12.1  |                                                        |
| -------------- | :----------------------------------------------------: |
| Precondition   |            User has friends on friends list            |
| Post condition |             User removes friend connection             |
| Step#          |                      Description                       |
| 1              |                User enters friends page                |
| 2              |              User clicks on remove friend              |
| 3              |         User selects friend from friends list          |
| 4              |             System errase friend from list             |
| 5              | System errase user from remove connection friends list |

### Use case 13 Create Group , UC13

| Actors Involved  |                                                             |
| ---------------- | :---------------------------------------------------------: |
| Precondition     |                      User is logged in                      |
| Post condition   |                      Group is created                       |
| Nominal Scenario |            User creates a group and add friends             |
| Variant          | User creates a group, add friends, and establishes a budget |

##### Scenario 13.1 Nominal

| Scenario 13.1  |                                                            |
| -------------- | :--------------------------------------------------------: |
| Precondition   |                     User is logged in                      |
| Post condition |                      Group is created                      |
| Step#          |                        Description                         |
| 1              |                   User enters groups tab                   |
| 2              |               User clicks on create a group                |
| 3              |  User enters name of the group and description(optional)   |
| 4              |            User selects friends to add to group            |
| 5              |       System creates group and adds it to group list       |
| 6              | System creates group members list and adds it to the group |

##### Scenario 13.2 Variant

| Scenario 13.2  |                                                                 |
| -------------- | :-------------------------------------------------------------: |
| Precondition   |                        User is logged in                        |
| Post condition |                        Group is created                         |
| Step#          |                           Description                           |
| 1              |                     User enters groups tab                      |
| 2              |                  User clicks on create a group                  |
| 3              | User enters name of the group, budget and description(optional) |
| 4              |              User selects friends to add to group               |
| 5              |         System creates group and adds it to group list          |
| 6              |   System creates group friends list and adds it to the group    |

### Use case 14 Add friends to group , UC14

| Actors Involved  |                                                                                                      |
| ---------------- | :--------------------------------------------------------------------------------------------------: |
| Precondition     |                                       User is part of a group                                        |
| Post condition   |                                     Friend is added to the group                                     |
| Nominal Scenario | User want to add a new friend or friends to the group and the system adds them to group friends list |
| Exception        |                                    Friend is already in the group                                    |

##### Scenario 14.1 Nominal

| Scenario 14.1  |                                                                         |
| -------------- | :---------------------------------------------------------------------: |
| Precondition   |                         User is part of a group                         |
| Post condition |                 Friend or friends is added to the group                 |
| Step#          |                               Description                               |
| 1              |                           User enters a group                           |
| 2              |           User click add friends button located on the group            |
| 3              |           User selects friend or friends to add to the group            |
| 4              |         Systems check that new friend is not part of the group          |
| 5              | User friend is added to the gruop and the group members list is updated |

##### Scenario 14.2 Exception

| Scenario 14.2  |                                                          |
| -------------- | :------------------------------------------------------: |
| Precondition   |                 User is part of a group                  |
| Post condition |       Friend or friends is not added to the group        |
| Step#          |                       Description                        |
| 1              |                   User enters a group                    |
| 2              |    User click add friends button located on the group    |
| 3              |    User selects friend or friends to add to the group    |
| 4              |  Systems check that new friend is not part of the group  |
| 5              | System gives back error "Friend is already in the group" |

### Use case 15 Exit from group , UC15

| Actors Involved  |                                                              |
| ---------------- | :----------------------------------------------------------: |
| Precondition     |                   User is part of a group                    |
| Post condition   |                       User exits group                       |
| Nominal Scenario | User select group he wants to exit and the system removes it |

##### Scenario 15.1 Nominal

| Scenario 15.1  |                                                       |
| -------------- | :---------------------------------------------------: |
| Precondition   |                User is part of a group                |
| Post condition |                   User exits group                    |
| Step#          |                      Description                      |
| 1              |                User enters groups tab                 |
| 2              |                  User enters a group                  |
| 3              |             User click exit group button              |
| 4              | System removes user from group and group members list |
| 5              |         Systems removes group from group list         |

### Use case 16 Add Transactions to group , UC16

| Actors Involved  |                                                                                                                        |
| ---------------- | :--------------------------------------------------------------------------------------------------------------------: |
| Precondition     |                                                    User is a group                                                     |
| Post condition   |                                     Transaction is created and added to the group                                      |
| Nominal Scenario | User provides information of name, amount, date and type and transaction is created within the group join transactions |

##### Scenario 16.1 Nominal

| Scenario 16.1  |                                                                          |
| -------------- | :----------------------------------------------------------------------: |
| Precondition   |                            User is in a group                            |
| Post condition |                          Transaction is created                          |
| Step#          |                               Description                                |
| 1              |                          User enters group tab                           |
| 2              |                  User enters one of the groups on list                   |
| 3              |                       User clicks on show expenses                       |
| 4              |                    User asks to create a transaction                     |
| 5              |                 User inputs name, amount, date and type                  |
| 6              | Transaction is created within the group in a common list of transactions |

### Use case 17 Delete Group Transaction, UC17

| Actors Involved  |                                                              |
| ---------------- | :----------------------------------------------------------: |
| Precondition     |                   User is part of a group                    |
| Post condition   |         Transaction are deleted from group expenses          |
| Nominal Scenario | User provides id or ids of transactions and they are deleted |

##### Scenario 17.1 Nominal

| Scenario 17.1  |                                                 |
| -------------- | :---------------------------------------------: |
| Precondition   |             User is part of a group             |
| Post condition |     Transaction or transactions are deleted     |
| Step#          |                   Description                   |
| 1              |              User enters group tab              |
| 2              |               User enters a group               |
| 3              |       User clicks on show group expenses        |
| 1              |        User asks to delete a transaction        |
| 2              | User provides transactions ids with check marks |
| 3              |              Systems looks for ids              |
| 4              |            Transactions are deleted             |

### Use case 18 Get group transactions, UC18

| Actors Involved  |                                                                                          |
| ---------------- | :--------------------------------------------------------------------------------------: |
| Precondition     |                                  User is part of group                                   |
| Post condition   |                      System gives back transaction list from group                       |
| Nominal Scenario |             User asks for group transactions list and the systems provide it             |
| Variant          | User asks for transaction list on a specific category or date and The system provides it |

##### Scenario 18.1 Nominal

| Scenario 18.1  |                                            |
| -------------- | :----------------------------------------: |
| Precondition   |          User is part of a group           |
| Post condition | System gives back group's transaction list |
| Step#          |                Description                 |
| 1              |           User enters group tab            |
| 2              |            User enters a group             |
| 3              |    User clicks on show expenses button     |
| 4              |    Systems gives back transaction list     |

##### Scenario 18.2 Variant

| Scenario 8.2   |                                            |
| -------------- | :----------------------------------------: |
| Precondition   |             User is logged in              |
| Post condition | System gives back transaction group's list |
| Step#          |                Description                 |
| 1              |           User enters group tab            |
| 2              |            User enters a group             |
| 3              |    User clicks on show expenses button     |
| 4              | USer provides filters for the transactions |
| 5              | Systems gives back filter transaction list |

### Use case 19 Connect with a bank, UC19

| Actors Involved  |                                                                                                |
| ---------------- | :--------------------------------------------------------------------------------------------: |
| Precondition     |                                       User is logged in                                        |
| Post condition   |                          User profile is connected with bank account                           |
| Nominal Scenario | User asks to connect with bank and automatically pass his transaction to the EzWallet web page |
| Exception 1      |           User asks to connect with bank and a error of connection or denies happens           |
| Exception 2      |               User asks to connect with bank and bank is not on available banks                |

##### Scenario 19.1 Nominal

| Scenario 18.1  |                                                   |
| -------------- | :-----------------------------------------------: |
| Precondition   |                 User is logged in                 |
| Post condition |    User profile is connected with bank account    |
| Step#          |                    Description                    |
| 1              |       User clicks on connect to bank button       |
| 2              |              User enters bank's name              |
| 3              | System checks if bank is available for connection |
| 4              |     System redirects user to linking web page     |
| 5              |    System checks if connections is succesfull     |
| 4              |    System imports transactions from bank page     |

##### Scenario 19.2 Exception 1

| Scenario 19.2  |                                                   |
| -------------- | :-----------------------------------------------: |
| Precondition   |                 User is logged in                 |
| Post condition |    User profile is connected with bank account    |
| Step#          |                    Description                    |
| 1              |       User clicks on connect to bank button       |
| 2              |              User enters bank's name              |
| 3              | System checks if bank is available for connection |
| 4              |     System redirects user to linking web page     |
| 5              |    System checks if connections is succesfull     |
| 6              |              System cancels process               |

##### Scenario 19.3 Exception 2

| Scenario 19.3  |                                                   |
| -------------- | :-----------------------------------------------: |
| Precondition   |                 User is logged in                 |
| Post condition |    User profile is connected with bank account    |
| Step#          |                    Description                    |
| 1              |       User clicks on connect to bank button       |
| 2              |              User enters bank's name              |
| 3              | System checks if bank is available for connection |
| 4              |              System cancels process               |

### Use case 20 Change password, UC20

| Actors Involved  |                                                                      |
| ---------------- | :------------------------------------------------------------------: |
| Precondition     |                        User is in log in page                        |
| Post condition   |                       User password is change                        |
| Nominal Scenario |   User asks to change password and password information is updated   |
| Exception        | User asks to change password but email or last password is incorrect |

##### Scenario 20.1 Nominal

| Scenario 20.1  |                                                   |
| -------------- | :-----------------------------------------------: |
| Precondition   |              User is in log in page               |
| Post condition |              User password is change              |
| Step#          |                    Description                    |
| 1              |              User is in log in page               |
| 2              |           User click on change password           |
| 3              | User enters email, last password and new password |
| 4              |           System updates users password           |

##### Scenario 20.2 Exception

| Scenario 20.2  |                                                               |
| -------------- | :-----------------------------------------------------------: |
| Precondition   |                    User is in log in page                     |
| Post condition |                    User password is change                    |
| Step#          |                          Description                          |
| 1              |                    User is in log in page                     |
| 2              |                 User click on change password                 |
| 3              |       User enters email, last password and new password       |
| 4              | System provides error "email or las password are not correct" |

### Use case 21 Create category, UC21

| Actors Involved  |                                                                             |
| ---------------- | :-------------------------------------------------------------------------: |
| Precondition     |                              User is logged in                              |
| Post condition   |                     System adds new category to server                      |
| Nominal Scenario | User clicks on a button when adding a new transaction to add a new category |

##### Scenario 21.1 Nominal

| Scenario 21.1  |                                            |
| -------------- | :----------------------------------------: |
| Precondition   |             User is logged in              |
| Post condition |     System adds new category to server     |
| Step#          |                Description                 |
| 1              | User clicks a button to create transaction |
| 2              |     User clicks on create new category     |
| 3              |    Systems adds new category to server     |

# Glossary

![Glossary diagram](assets/diagrams/GlossaryV2.png)

# System Design

![system design diagram](assets/diagrams/system_designV2.png)

# Deployment Diagram

![Deployment diagram](assets/diagrams/deployment_diagramV2.png)

# Table of solved defects

| Defects                                       |                                                                                       Description                                                                                       |
| --------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Admin is not well defined                     | Each admin will receive credentials which are preauthorized by the system for admin access and will then be able to access admin methods by logging in in the same page as normal users |
| Non existing category when adding transaction |                    Whenever a user adds a new transaction the system will provide a list of previously added categories and also the possibility to insert a new one                    |
