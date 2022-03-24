```
knex migrate:latest
```

1. create people-001 index
2. create people -> people-XXX alias
3. create policy `PUT _ilm/policy/<policy_id>`
   `http put localhost:9200/_ilm/policy/default_policy < create-lifecycle-policy.json`
4. create index template `PUT _index_template/<template_id>`
   `http put localhost:9200/_index_template/people_template < create-template.json`
5. create initial index `PUT <index_id>`
   `http put localhost:9200/people-000001 < create-initial-index.json`
   adding `is_write_index` causes index to be added and phased out, rather than replaced
6. check ilm status `GET <alias_id>/_ilm/explain`
7. create rollover with max-age = <interval>

```
http put localhost:9200/_ilm/policy/default_policy < elastic-scripts/create-lifecycle-policy.json
http put localhost:9200/_index_template/people_template < elastic-scripts/create-template.json
http put localhost:9200/people-000001 < elastic-scripts/create-initial-index.json
```

```
output {
  elasticsearch {
    hosts => ["http://elastic:9200"]
    document_id => "%{id}"
    index => "people-%{+YYYY.MM.dd.HH.mm}"
    ilm_enabled => true
  }
}
```
