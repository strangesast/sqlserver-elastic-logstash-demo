from docker.elastic.co/logstash/logstash:8.1.0

user root

run mkdir -p /usr/share/logstash/logstash-core/lib/jars && \
  curl -L -o /usr/share/logstash/logstash-core/lib/jars/mssql-jdbc-10.2.0.jre11.jar \
    https://github.com/microsoft/mssql-jdbc/releases/download/v10.2.0/mssql-jdbc-10.2.0.jre11.jar
