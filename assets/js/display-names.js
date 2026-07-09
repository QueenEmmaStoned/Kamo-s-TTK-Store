function humanizeStoreName(text) {
    if (!text) {
        return "";
    }

    let name = text
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();

    name = reorderEggName(name);
    name = moveLeadingClarifierToEnd(name);

    return name;
}

function reorderEggName(name) {
    const words = name.split(/\s+/);

    const eggIndex = words.indexOf("Egg");
    const statusIndex = words.findIndex(word =>
        word === "Fertilized" || word === "Unfertilized"
    );

    if (eggIndex === -1 || statusIndex === -1) {
        return name;
    }

    const status = words[statusIndex];

    const remainingWords = words.filter((word, index) =>
        index !== eggIndex && index !== statusIndex
    );

    return [status, ...remainingWords, "Egg"].join(" ");
}

function moveLeadingClarifierToEnd(name) {
    const words = name.split(/\s+/);

    if (words.length < 2) {
        return name;
    }

    const leadingClarifiers = new Set([
        "Meat",
        "Leather",
        "Wool",
        "Egg"
    ]);

    const firstWord = words[0];

    if (leadingClarifiers.has(firstWord)) {
        return words.slice(1).join(" ") + " " + firstWord;
    }

    return name;
}

window.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".store-display-name").forEach(function (element) {
        element.textContent = humanizeStoreName(element.textContent);
    });
});
