import { render, html } from "uhtml";

interface IPerson {
  id: number;
  FirstName: string;
  LastName: string;
  Deleted: boolean;
}

const modes = ["query_string", "phrase_prefix", "match_full_name"];

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
        : value.mode === "phrase_prefix"
        ? {
            query: {
              // multi_match: {
              //   fields: ["FirstName", "LastName"],
              //   query: value.search,
              //   type: "phrase_prefix",
              // },
              combined_fields: {
                fields: ["FirstName", "LastName"],
                query: value.search,
                operator: "and",
              },
            },
          }
        : {
            query: {
              match: {
              // match_phrase_prefix: {
                FullName: {
                  query: value.search,
                  operator: "and",
                },
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
      .then((o) =>
        (o?.hits?.hits ?? []).sort((a: any, b: any) =>
          a._score > b._score ? -1 : 1
        )
      );
  }
  render(
    document.body.querySelector("#searchResults"),
    html`
      <ul>
        ${results.map(
          (o: any) =>
            html`<li>
              ${o._source.FirstName} ${o._source.LastName} (${o._score})
            </li>`
        )}
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

  const peopleResults = await getPeople();

  render(
    document.body,
    html`
      <h1>Search</h1>
      <form
        id="search"
        oninput=${searchInputHandler}
        onSubmit="return false;"
        action=""
      >
        <div>
          ${modes.map(
            (s, i) => html`
              <input
                type="radio"
                id="${"mode-" + i}"
                name="mode"
                value="${s}"
              />
              <label for="${"mode-" + i}">${s}</label>
            `
          )}
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

      <h1>People (${peopleResults.limit}/${peopleResults.total})</h1>
      <ul>
        ${peopleResults.results.map((person) =>
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

async function getPeople(
  offset?: number,
  limit?: number
): Promise<{
  results: IPerson[];
  offset: number;
  limit: number;
  total: number;
}> {
  const q = new URLSearchParams();
  if (offset) {
    q.append("offset", "" + offset);
  }
  if (limit) {
    q.append("limit", "" + limit);
  }
  const s = q.toString();
  const response = await fetch(`/api/people${s.length ? "?" + s : ""}`);
  if (response.status >= 200 && response.status < 400) {
    const body = await response.json();
    return body;
  }
  const msg = await response.text();
  return Promise.reject(msg);
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
