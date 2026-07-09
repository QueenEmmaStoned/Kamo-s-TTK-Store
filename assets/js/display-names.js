function humanizeStoreName(text, commandName) {
    if (!text) {
        return "";
    }

    const rawDisplayName = text.trim();
    const rawCommandName = (commandName || "").trim();

    const shouldUseCommandName =
        rawCommandName && shouldUseCommandNameAsDisplay(rawDisplayName, rawCommandName);

    let name = shouldUseCommandName ? rawCommandName : rawDisplayName;

    name = applyManualCommandSpacing(name);

    name = name
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();

    if (shouldUseCommandName) {
        return name;
    }

    name = removeDisplayOnlyTags(name);
    name = movePriorityTagsToFront(name);
    name = moveLeadingTagsToEnd(name);
    name = reorderEggName(name);
    name = moveLeadingClarifierToEnd(name);

    return name;
}

function shouldUseCommandNameAsDisplay(rawDisplayName, rawCommandName) {
    const displayPrefixes = [
        "HAR",
        "Aya"
    ];

    return displayPrefixes.some(function (prefix) {
        return rawDisplayName.startsWith(prefix);
        });
    }

function applyManualCommandSpacing(name) {
    const manualRules = [
        // evedkerenofthedragon -> Evedkeren of the Dragon
        {
            pattern: /^(.+?)ofthe(.+)$/i,
            replace: function (match, firstWord, lastWord) {
                return capitalizeFirstLetter(firstWord) + " of the " + capitalizeFirstLetter(lastWord);
            }
        },

        // alethianskiawear -> Alethian Skiawear
        {
            pattern: /^(.+?)skiawear$/i,
            replace: function (match, itemName) {
                return titleCaseKnownWords(itemName) + " Skiawear";
            }
        },

        // elyonarmor -> Elyon Armor
        {
            pattern: /^elyon(.+)$/i,
            replace: function (match, itemName) {
                return "Elyon " + titleCaseKnownWords(itemName);
            }
        },

        // ishbaaldecadentdress -> Ishbaal Decadent Dress
        {
            pattern: /^ishbaal(.+)$/i,
            replace: function (match, itemName) {
                return "Ishbaal " + titleCaseKnownWords(itemName);
            }
        },

        // ishmutianchild'sblouse -> Ishmutian Child's Blouse
        {
            pattern: /^ishmutianchild'?s(.+)$/i,
            replace: function (match, itemName) {
                return "Ishmutian Child's " + titleCaseKnownWords(itemName);
            }
        },

        // skiahelmet -> Skia Helmet
        {
            pattern: /^skia(.+)$/i,
            replace: function (match, itemName) {
                return "Skia " + titleCaseKnownWords(itemName);
            }
        },

        // yuumeat -> Yuu Meat
        {
            pattern: /^(.+?)meat$/i,
            replace: function (match, creatureName) {
                return titleCaseKnownWords(creatureName) + " Meat";
            }
        }
    ];

    for (const rule of manualRules) {
        if (rule.pattern.test(name)) {
            return name.replace(rule.pattern, rule.replace).trim();
        }
    }

    return name;
}
function titleCaseKnownWords(text) {
    let spaced = splitKnownSuffix(text);

    spaced = spaced
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();

    return spaced
        .split(/\s+/)
        .map(capitalizeFirstLetter)
        .join(" ");
}

function splitKnownSuffix(text) {
    const knownSuffixes = [
        "blouse",
        "dress",
        "helmet",
        "armor",
        "shirt",
        "pants",
        "robe",
        "cape",
        "hood",
        "mask",
        "veil",
        "coat",
        "jacket",
        "boots",
        "gloves",
        "hat",
        "crown",
        "collar",
        "belt"
    ];

    const lowerText = text.toLowerCase();

    for (const suffix of knownSuffixes) {
        if (lowerText.endsWith(suffix) && lowerText.length > suffix.length) {
            const firstPart = text.slice(0, text.length - suffix.length);
            const lastPart = text.slice(text.length - suffix.length);
            return firstPart + " " + lastPart;
        }
    }

    return text;
}

function capitalizeFirstLetter(word) {
    if (!word) {
        return word;
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function capitalizeFirstAndLastWords(name) {
    const words = name.split(/\s+/);

    if (words.length === 0) {
        return name;
    }

    words[0] = capitalizeFirstLetter(words[0]);

    if (words.length > 1) {
        const lastIndex = words.length - 1;
        words[lastIndex] = capitalizeFirstLetter(words[lastIndex]);
        }

    return words.join(" ");
    }

function capitalizeFirstLetter(word) {
    if (!word) {
        return word;
    }

    return word.charAt(0).toUpperCase() + word.slice(1);
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
        const commandName = element.dataset.commandName || "";
        element.textContent = humanizeStoreName(element.textContent, commandName);
    });
});
