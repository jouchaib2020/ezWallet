# Project Estimation - CURRENT

Date: 22

Version: 1.0

# Estimation approach

Consider the EZWallet project in CURRENT version (as received by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course

# Estimate by size

###

|                                                                                                         | Estimate |
| ------------------------------------------------------------------------------------------------------- | -------- |
| NC = Estimated number of classes to be developed                                                        | 20       |
| A = Estimated average size per class, in LOC                                                            | 75       |
| S = Estimated size of project, in LOC (= NC \* A)                                                       | 1500     |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    | 150      |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     | 4.500    |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) | 1        |

# Estimate by product decomposition

###

| component name       | Estimated effort (person hours) |
| -------------------- | ------------------------------- |
| requirement document | 4                               |
| GUI prototype        | 2                               |
| design document      | 2                               |
| code                 | 100                             |
| unit tests           | 30                              |
| api tests            | 20                              |
| management documents | 3                               |

# Estimate by activity decomposition

###

| Activity name                             | Estimated effort (person hours) |
| ----------------------------------------- | ------------------------------- |
| Code Rewiew Meeting                       | 2                               |
| Stakeholders and Persona Analysis         | 1                               |
| Functiona and Non Functional Requirements | 1                               |
| Use Cases, Scenarions And Diagrams        | 1                               |
| GUI prototype                             | 2                               |
| Time evaluation                           | 1                               |
| Estimation Document                       | 1                               |
| Review Meeting                            | 3                               |
| coding                                    | 150                             |

###

![gantt chart](assets/diagrams/ganttv1.png "Gantt Chart")

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|                                    | Estimated effort | Estimated duration |
| ---------------------------------- | ---------------- | ------------------ |
| estimate by size                   | 150 ph           | 1 week             |
| estimate by product decomposition  | 161 ph           | 1                  |
| estimate by activity decomposition | 163 ph           | 1                  |

\*( Assuming 8 hours per day, 5 days per week and a team of 4 people,)

The estimation based on size is not extremly precise considering that the LOC produced are not constant and can vary alot during the production of the code, this makes the estimation not very precise and can lead to underestimate or overestimate the effort needed.
Considering the other two approaches to estimate the time and effort neede they are surely more precise but with the estimation by activity the over estimation is more prone to happen sicne the time reserved for each activity can be easily be more than needed.

All three methods don't share consistency between them, this is probaly caused by the fact that each one of them approaches the problem from different sides.
