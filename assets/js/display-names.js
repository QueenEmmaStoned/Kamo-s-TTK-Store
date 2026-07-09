function humanizeStoreName(text) {
    if (!text) {
        return "";
    }
    const rawName = text.trim();
    
    let name = text
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();

    if (shouldSkipDisplayNameCleanup(rawName)) {
        return name;
    }
    
    name = removeDisplayOnlyTags(name);
    name = movePriorityTagsToFront(name);
    name = moveLeadingTagsToEnd(name);
    name = reorderEggName(name);
    name = moveLeadingClarifierToEnd(name);

    return name;
}

function shouldSkipDisplayNameCleanup(rawName) {
    const skippedPrefixes = [
        "HAR",
        "Aya"
    ];

    return skippedPrefixes.some(function (prefix) {
        return rawName.startsWith(prefix);
        });
    }

function removeDisplayOnlyTags(name) {
        const removableTags = new Set([
            "Apparel",
            "Armor",
            "Footwear",
            "Headgear",
            "Handwear",
            "Building",
            "Relic Inert",
            "Simple",
            "Mawy",
            "Industrial"
        ]);
    
        return name
            .split(/\s+/)
            .filter(word => !removableTags.has(word))
            .join(" ")
            .trim();
    }
function movePriorityTagsToFront(name) {
    const priorityTags = [
        "Prestige",
        "VPE",
        "VAE",
        "DBH",
        "VCE",
        "VREA",
        "AEXP",
        "LWM",
        "VBE",
        "AT"
        
    ];

    let words = name.split(/\s+/);
    const foundTags = [];

    priorityTags.forEach(function (tag) {
        const index = words.indexOf(tag);

        if (index !== -1) {
            foundTags.push(tag);
            words.splice(index, 1);
            }
        });

    if (foundTags.length === 0) {
        return name;
        }

    return [...foundTags, ...words].join(" ");
    }

function moveLeadingTagsToEnd(name) {
    const tagPhrases = [
        ["Animal", "Vaccine"],
        ["Vaccine"],
        ["Targeter"],
        ["Psytrainer"]
    ];

    const words = name.split(/\s+/);

    for (const tagWords of tagPhrases) {
        const startsWithTag = tagWords.every((tagWord, index) => words[index] === tagWord);

        if (startsWithTag && words.length > tagWords.length) {
            const remainingWords = words.slice(tagWords.length);
            return [...remainingWords, ...tagWords].join(" ");
            }
        }

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
        "Egg",
        "Meal",
        "Trap",
        "Shell",
        "Subcore",
        "Medicine",
        "Mech Serum",
        "Pack",
        "Sculpture",
        "Nature Shrine",
        "Radiator",
        "Blocks",
        "Turret",
        "Pallet",
        "Crown",
        "Techprint"
        
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
