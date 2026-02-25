# Screeps scripts 

- We should consider wrapping the api into a proxy to ensure that our constructs lives at same level (virtually), as the native method and to provide better error handling.
- As though of prior we should structure our scripts into different groups, which then control a collection of screeps and structures. Altough we should still have each individual hold their own behavior, but in such a way, that they are influencable by the container. This should ensure that we have good capsulation, as for example, defense, base gathering, constructing and so on do not have to live in the same category.

## Phases

To ensure a structured buildup of our colony a region, we should ensure that this buildup is conducted in phases, as to separate concerns and to not introduce required complexity for build up into maintenance or repairing the colonies holding.