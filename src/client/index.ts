import { render, html } from "uhtml";

interface IPerson {
  id: number;
  FirstName: string;
  LastName: string;
  Deleted: boolean;
}

let abort: any = null;

const searchInputHandler = async (e: any) => {
  if (abort != null) {
    abort();
  }

  const value = Object.fromEntries(
    new FormData(document.body.querySelector("#search")).entries()
  );

  let results: any[];

  if (!value?.search || !value?.mode) {
    abort = null;
    results = [];
  } else {
    const controller = new AbortController();
    const signal = controller.signal;
    abort = controller.abort.bind(controller);

    const indexName = "people";
    const url = `/elastic/${indexName}/_search`;
    const body =
      value.mode === "query_string"
        ? {
            query: {
              query_string: {
                query: value.search,
              },
            },
          }
        : {
            query: {
              multi_match: {
                fields: ["FirstName", "LastName"],
                query: value.search,
                type: "phrase_prefix",
              },
            },
          };
    results = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify(body),
    })
      .catch((e) => null)
      .then((r) => (r != null ? r.json() : null))
      .then((o) => o?.hits?.hits ?? []);
  }
  render(
    document.body.querySelector("#searchResults"),
    html`
      <ul>
        ${results.map((o: any) => html`<li>${o._source.FirstName} ${o._source.LastName} (${o._index})</li>`)}
      </ul>
    `
  );
};

const buttonHandler = async (e: any) => {
  const formData = new FormData(e.target);

  const o = Object.fromEntries(formData.entries());

  e.target.reset();
  createPeople(o as any).then((person) => {
    console.log("person", person);
    return refresh();
  });

  e.preventDefault();
  return false;
};

const deleteHandler = async (o: any) => {
  deletePeople(o as any).then((result) => {
    console.log("result", result);
    return refresh();
  });
};

const refresh = async () => {
  // const q = new URLSearchParams({ pretty: "true" });

  const people = await getPeople();

  render(
    document.body,
    html`
      <h1>Search</h1>
      <form id="search" oninput=${searchInputHandler}>
        <div>
          <input type="radio" id="mode-a" name="mode" value="query_string" />
          <label for="mode-a">query_string</label>
          <input type="radio" id="mode-b" name="mode" value="phrase_prefix" />
          <label for="mode-b">phrase_prefix</label>
        </div>
        <div>
          <input type="text" placeholder="Search" name="search" />
        </div>
      </form>
      <div id="searchResults"></div>
      <h1>Create Person</h1>
      <form onsubmit=${buttonHandler}>
        <input type="text" placeholder="FirstName" name="FirstName" />
        <input type="text" placeholder="LastName" name="LastName" />
        <button type="submit">Create</button>
        <button type="reset">Clear</button>
      </form>

      <h1>People</h1>
      <ul>
        ${people.map((person) =>
          !person.Deleted
            ? html`
                <li>
                  <span
                    >${person.FirstName} ${person.LastName} (${person.id})</span
                  >
                  <button onclick=${deleteHandler.bind(null, person)}>
                    Delete
                  </button>
                </li>
              `
            : html`
                <li>
                  <s
                    ><span
                      >${person.FirstName} ${person.LastName}
                      (${person.id})</span
                    ></s
                  >
                </li>
              `
        )}
      </ul>
    `
  );
};

refresh();

async function getHealth() {
  const response = await fetch(`/elastic/_cluster/health`);
  const body = await response.json();
  return body;
}

async function getPeople(): Promise<IPerson[]> {
  const response = await fetch(`/api/people`);
  const body = await response.json();
  return body;
}

async function createPeople(o: IPerson) {
  const response = await fetch(`/api/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(o),
  });
  const body = await response.json();
  return body;
}

async function deletePeople(o: { id: string }) {
  const response = await fetch(`/api/people`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(o),
  });
  const body = await response.json();
  return body;
}
