function humanizeStoreName(text, commandName) {
    if (!text) {
        return "";
    }

    const rawDisplayName = text.trim();
    const rawCommandName = (commandName || "").trim();

    const shouldUseTableCommandName =
        shouldUseCommandNameForTable(rawDisplayName, rawCommandName);

    const shouldUseFormattedCommandName =
        shouldUseCommandNameForSpecialFormattedItem(rawDisplayName, rawCommandName);

    const shouldUseCommandName =
        rawCommandName && shouldUseCommandNameAsDisplay(rawDisplayName, rawCommandName);

    let name = rawDisplayName;

    if (shouldUseTableCommandName) {
        return formatTableCommandName(rawCommandName);
    }

    if (shouldUseFormattedCommandName) {
        return formatSpecialCommandName(rawCommandName);
    }

    if (shouldUseCommandName) {
        name = rawCommandName;
    }

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
    name = removeLeadingFishAnimalTag(name);
    name = movePriorityTagsToFront(name);
    name = moveLeadingTagsToEnd(name);
    name = formatAnimalVaccineName(name);

    if (!isEggBoxName(name, rawCommandName)) {
        name = reorderEggName(name);
        name = moveLeadingClarifierToEnd(name);
    }

    name = addArtificialFromCommandName(name, rawCommandName);
    name = moveSlaveToFront(name);
    name = moveSmallToFront(name);
    name = moveHatToEnd(name);
    name = capitalizeSingleWordEvelietName(name, rawDisplayName);

    return name;
}

function shouldUseCommandNameAsDisplay(rawDisplayName, rawCommandName) {
    const startsWithSpecialPrefix =
        rawDisplayName.startsWith("HAR") ||
        rawDisplayName.startsWith("Aya");

    return rawCommandName && startsWithSpecialPrefix;
}

function moveSlaveToFront(name) {
    return moveWordToFront(name, "Slave");
}

function moveSmallToFront(name) {
    return moveWordToFront(name, "Small");
}

function moveHatToEnd(name) {
    return moveWordToEnd(name, "Hat");
}

function moveWordToFront(name, wordToMove) {
    const words = name.split(/\s+/);
    const index = words.findIndex(word => word.toLowerCase() === wordToMove.toLowerCase());

    if (index <= 0) {
        return name;
    }

    const foundWord = words.splice(index, 1)[0];
    return [foundWord, ...words].join(" ");
}

function moveWordToEnd(name, wordToMove) {
    const words = name.split(/\s+/);
    const index = words.findIndex(word => word.toLowerCase() === wordToMove.toLowerCase());

    if (index === -1 || index === words.length - 1) {
        return name;
    }

    const foundWord = words.splice(index, 1)[0];
    return [...words, foundWord].join(" ");
}

function shouldUseCommandNameForTable(rawDisplayName, rawCommandName) {
    return (
        rawCommandName &&
        (
            /\bTable\b/i.test(rawDisplayName) ||
            /table$/i.test(rawCommandName)
        )
    );
}

function formatTableCommandName(rawCommandName) {
    return titleCaseKnownWords(
        rawCommandName.replace(/table$/i, " table")
    );
}

function shouldUseCommandNameForSpecialFormattedItem(rawDisplayName, rawCommandName) {
    if (!rawCommandName) {
        return false;
    }

    return (
        isNanoOrMechaniteSpecial(rawCommandName) ||
        isTrainerOrTechprint(rawCommandName) ||
        isTreatmentPill(rawCommandName) ||
        isDbhStuffItem(rawDisplayName, rawCommandName)
    );
}

function formatSpecialCommandName(rawCommandName) {
    if (isNanoOrMechaniteSpecial(rawCommandName)) {
        return formatNanoOrMechaniteSpecial(rawCommandName);
    }

    if (isTrainerOrTechprint(rawCommandName)) {
        return formatTrainerOrTechprint(rawCommandName);
    }

    if (isTreatmentPill(rawCommandName)) {
        return formatTreatmentPill(rawCommandName);
    }

    if (isDbhStuffItem("", rawCommandName)) {
        return titleCaseKnownWords(rawCommandName);
    }

    return titleCaseKnownWords(rawCommandName);
}

function isHarMeatDisplayName(displayName) {
    return (
        /^HAR\s+(CO\s+Race|EL\s+Monster).*Meat$/i.test(displayName) ||
        /^Meat[_\s]+HAR[_\s]+(CO[_\s]+Race|EL[_\s]+Monster)/i.test(displayName)
    );
}

function formatAnimalVaccineName(name) {
    return name
        .replace(/^Animal\s+Vaccine\s+(.+)$/i, "$1 Vaccine (Animal)")
        .replace(/^(.+?)\s+Animal\s+Vaccine$/i, "$1 Vaccine (Animal)")
        .replace(/\s+/g, " ")
        .trim();
}

function isTrainerOrTechprint(rawCommandName) {
    return /^(skilltrainer|psytrainer|techprint)\(/i.test(rawCommandName || "");
}

function formatTrainerOrTechprint(rawCommandName) {
    const match = rawCommandName.match(/^(skilltrainer|psytrainer|techprint)\((.+?)\)$/i);

    if (!match) {
        return titleCaseKnownWords(rawCommandName);
    }

    const type = titleCaseKnownWords(match[1]);
    const purpose = titleCaseKnownWords(match[2]);

    return type + " - " + purpose;
}

function isDbhStuffItem(rawDisplayName, rawCommandName) {
    const displayLooksDbh = /\bDBH\b/i.test(rawDisplayName || "");
    const commandLooksStuff =
        /(stuff|stuffed)/i.test(rawCommandName || "");

    return displayLooksDbh && commandLooksStuff;
}

function capitalizeSingleWordEvelietName(name, rawDisplayName) {
    const isEveliet =
        /\bHAR\b/i.test(rawDisplayName || "") ||
        /\bAya\b/i.test(rawDisplayName || "");

    const isSingleWord = /^[a-z]+$/i.test(name);

    if (isEveliet && isSingleWord) {
        return capitalizeFirstLetter(name);
    }

    return name;
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
        
        {
            pattern: /^slave(.+)$/i,
            replace: function (match, itemName) {
                return "Slave " + titleCaseKnownWords(itemName);
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

function normalizeNameSpacing(name) {
    return name
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();
}

function removeDisplayOnlyTags(name) {
    const tagPhrases = [
        ["Vanilla", "Expanded"],
        ["VAE", "Roy"],
        ["VAE", "Waste"],
        ["DP", "AT"],
        ["LWM", "Deep", "Storage"],
        ["Melee", "Weapon"],
        ["Gun"],
        ["Raw"],
        ["VAE"],
        ["AEXP"],
        ["VPE"],
        ["VWE"],
        ["VBE"],
        ["VCE"],
        ["VREA"],
        ["MP"],
        ["AT"],
        ["SAB"],
        ["LWM"],
        ["DR"],
        ["DBH"],
        ["BMOT"],
        ["GM"],
        ["SBC"],
        ["DP"],
        ["Apparel"],
        ["Footwear"],
        ["Headgear"],
        ["Handwear"],
        ["Building"],
        ["Relic"],
        ["Inert"],
        ["Mawy"],
        ["Industrial"],
        ["VHE"],
        ["Vce"]
    ];

    return removeTagPhrases(name, tagPhrases);
}

function addArtificialFromCommandName(name, rawCommandName) {
    const commandHasArtificial = /artificial/i.test(rawCommandName || "");
    const nameAlreadyHasArtificial = /\bArtificial\b/i.test(name);

    if (commandHasArtificial && !nameAlreadyHasArtificial) {
        return "Artificial " + name;
    }

    return name;
}

function removeLeadingFishAnimalTag(name) {
    return name.replace(/^Fish\s+(.+)$/i, "$1").trim();
}

function removeTagPhrases(name, tagPhrases) {
    let words = name.split(/\s+/).filter(Boolean);
    let changed = true;

    while (changed) {
        changed = false;

        for (const phrase of tagPhrases) {
            for (let i = 0; i <= words.length - phrase.length; i++) {
                const matches = phrase.every(function (tagWord, offset) {
                    return words[i + offset] === tagWord;
                });

                if (matches) {
                    words.splice(i, phrase.length);
                    changed = true;
                    break;
                }
            }

            if (changed) {
                break;
            }
        }
    }

    return words.join(" ").trim();
}

function movePriorityTagsToFront(name) {
    const priorityTags = [
        "Prestige"
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

function isNanoOrMechaniteSpecial(rawCommandName) {
    return (
        /^nano(vaccine|neutralizer)/i.test(rawCommandName) ||
        /^mechanite(stabilizer|neutralizer)/i.test(rawCommandName)
    );
}

function formatNanoOrMechaniteSpecial(rawCommandName) {
    let name = rawCommandName.trim();

    const parentheticalMatch = name.match(/^(.+?)\((.+?)\)$/);

    let base = name;
    let purpose = "";

    if (parentheticalMatch) {
        base = parentheticalMatch[1];
        purpose = parentheticalMatch[2];
    }

    base = base
        .replace(/^nanovaccine/i, "Nano Vaccine")
        .replace(/^nanoneutralizer/i, "Nano Neutralizer")
        .replace(/^mechanitestabilizer/i, "Mechanite Stabilizer")
        .replace(/^mechaniteneutralizer/i, "Mechanite Neutralizer")
        .trim();

    if (purpose) {
        return base + " - " + titleCaseKnownWords(purpose);
    }

    return base;
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

function isEggBoxName(name, rawCommandName) {
    return (
        /^Egg\s+Box\b/i.test(name) ||
        /eggbox/i.test(rawCommandName || "")
    );
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

function formatAnimalVaccineName(name) {
    return name
        .replace(/^Animal\s+Vaccine\s+(.+)$/i, "$1 Vaccine (Animal)")
        .replace(/^(.+?)\s+Animal\s+Vaccine$/i, "$1 Vaccine (Animal)")
        .replace(/\s+/g, " ")
        .trim();
}

function isTreatmentPill(rawCommandName) {
    return /treatmentpill$/i.test(rawCommandName || "");
}

function formatTreatmentPill(rawCommandName) {
    return titleCaseKnownWords(
        rawCommandName.replace(/treatmentpill$/i, " treatment pill")
    );
}

function moveLeadingClarifierToEnd(name) {
    const words = name.split(/\s+/);

    if (words.length < 2) {
        return name;
    }

    const leadingClarifierPhrases = [
        ["Mech", "Serum"],
        ["Nature", "Shrine"]
    ];

    for (const phrase of leadingClarifierPhrases) {
        const startsWithPhrase = phrase.every((word, index) => words[index] === word);

        if (startsWithPhrase && words.length > phrase.length) {
            return [...words.slice(phrase.length), ...phrase].join(" ");
        }
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
        "Pack",
        "Sculpture",
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

function titleCaseKnownWords(text) {
    let spaced = splitKnownSuffix(text);
    spaced = normalizeNameSpacing(spaced);

    return spaced
        .split(/\s+/)
        .map(capitalizeFirstLetter)
        .join(" ");
}

function splitKnownSuffix(text) {
    const knownSuffixes = [
    "bodystrap",
    "strap",
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
    "belt",
    "table",
    "pill",
    "vaccine",
    "neutralizer",
    "stabilizer"
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

window.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".store-display-name").forEach(function (element) {
        const displayName = element.textContent.trim();
        const commandName = element.dataset.commandName || "";

        if (isHarMeatDisplayName(displayName) && commandName) {
            element.textContent = humanizeStoreName(commandName, "");
            return;
        }

        element.textContent = humanizeStoreName(displayName, commandName);
    });
});
