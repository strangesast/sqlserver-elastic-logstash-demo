#!/bin/bash

http put localhost:9200/_ilm/policy/default_policy < elastic-scripts/create-lifecycle-policy.json
http put localhost:9200/_index_template/people_template < elastic-scripts/create-template.json
http put localhost:9200/people-000001 < elastic-scripts/create-initial-index-with-alias.json 
#http post localhost:9200/_aliases < elastic-scripts/create-alias.json 
