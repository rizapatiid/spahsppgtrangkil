
fetch("https://react.dev/errors/441").then(r => r.text()).then(t => console.log(t.substring(t.indexOf("The full text of the error"), t.indexOf("The full text of the error") + 500)))

