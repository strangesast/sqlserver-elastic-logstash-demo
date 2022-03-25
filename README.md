# Elasticsearch Logstash (SQLServer) Demo

pipe sql query into elasticsearch index, periodically update, periodically delete + refresh

1. `docker-compose up -d elastic db client server`
2. `./init-elastic-search.sh`
   1. create policy `PUT _ilm/policy/<policy_id>`
      `http put localhost:9200/_ilm/policy/default_policy < create-lifecycle-policy.json`
   2. create index template `PUT _index_template/<template_id>`
      `http put localhost:9200/_index_template/people_template < create-template.json`
   3. create initial index `PUT <index_id>`
      `http put localhost:9200/people-000001 < create-initial-index.json`
      adding `is_write_index` causes index to be added and phased out, rather than replaced
   4. check ilm status `GET <alias_id>/_ilm/explain`
3. `docker-compose up -d logstash`
