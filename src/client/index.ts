import { render, html } from "uhtml";

interface IPerson {
  id: number;
  FirstName: string;
  LastName: string;
}

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
      <h1>Create Person</h1>
      <form onsubmit=${buttonHandler}>
        <input type="text" placeholder="FirstName" name="FirstName" />
        <input type="text" placeholder="LastName" name="LastName" />
        <button type="submit">Create</button>
        <button type="reset">Clear</button>
      </form>

      <h1>People</h1>
      <ul>
        ${people.map(
          (person) => html`
            <li>
              <span>${person.FirstName} ${person.LastName} (${person.id})</span>
              <button onclick=${deleteHandler.bind(null, person)}>
                Delete
              </button>
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
