function humanizeStoreName(text, commandName) {
    if (!text) {
        return "";
    }

    const rawDisplayName = text.trim();
    const rawCommandName = (commandName || "").trim();

    const mismatchOverride = getMismatchedCommandNameOverride(rawDisplayName, rawCommandName);
    if (mismatchOverride) {
        return mismatchOverride;
    }

    if (shouldUseCommandNameForTable(rawDisplayName, rawCommandName)) {
        return formatTableCommandName(rawCommandName);
    }

    if (shouldUseCommandNameForSpecialFormattedItem(rawDisplayName, rawCommandName)) {
        return formatSpecialCommandName(rawDisplayName, rawCommandName);
    }

    const usingCommandName = shouldUseCommandNameAsDisplay(rawDisplayName, rawCommandName);
    let name = usingCommandName ? rawCommandName : rawDisplayName;

    name = applyManualCommandSpacing(name);
    name = normalizeNameSpacing(name);

    if (usingCommandName) {
        name = capitalizeSingleWordEvelietName(name, rawDisplayName);
        return finalClean(name);
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

    return finalClean(name);
}

function finalClean(name) {
    return name
        .replace(/\s+/g, " ")
        .replace(/\s+\)/g, ")")
        .replace(/\(\s+/g, "(")
        .replace(/\s+-\s+/g, " - ")
        .trim();
}

function normalizeNameSpacing(name) {
    return name
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();
}

function shouldUseCommandNameAsDisplay(rawDisplayName, rawCommandName) {
    if (!rawCommandName) {
        return false;
    }

    return (
        rawDisplayName.startsWith("HAR") ||
        rawDisplayName.startsWith("Aya")
    );
}

function displayNameMatchesCommandName(rawDisplayName, rawCommandName) {
    if (!rawDisplayName || !rawCommandName) {
        return false;
    }

    return normalizeForNameComparison(rawDisplayName) === normalizeForNameComparison(rawCommandName);
}

function normalizeForNameComparison(name) {
    return String(name || "")
        .replace(/&amp;/g, "and")
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
}

function shouldUseCommandNameForMismatch(rawDisplayName, rawCommandName) {
    if (!rawCommandName) {
        return false;
    }

    if (displayNameMatchesCommandName(rawDisplayName, rawCommandName)) {
        return false;
    }

    return true;
}

function shouldUseCommandNameForTable(rawDisplayName, rawCommandName) {
    return Boolean(
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

function formatSpecialCommandName(rawDisplayName, rawCommandName) {
    if (isNanoOrMechaniteSpecial(rawCommandName)) {
        return formatNanoOrMechaniteSpecial(rawCommandName);
    }

    if (isTrainerOrTechprint(rawCommandName)) {
        return formatTrainerOrTechprint(rawCommandName);
    }

    if (isTreatmentPill(rawCommandName)) {
        return formatTreatmentPill(rawCommandName);
    }

    if (isDbhStuffItem(rawDisplayName, rawCommandName)) {
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

function isEggBoxName(name, rawCommandName) {
    return (
        /^Egg\s+Box\b/i.test(name) ||
        /eggbox/i.test(rawCommandName || "")
    );
}

function applyManualCommandSpacing(name) {
    const manualRules = [
        {
            pattern: /^(.+?)ofthe(.+)$/i,
            replace: function (match, firstWord, lastWord) {
                return capitalizeFirstLetter(firstWord) + " of the " + capitalizeFirstLetter(lastWord);
            }
        },
        {
            pattern: /^(.+?)skiawear$/i,
            replace: function (match, itemName) {
                return titleCaseKnownWords(itemName) + " Skiawear";
            }
        },
        {
            pattern: /^elyon(.+)$/i,
            replace: function (match, itemName) {
                return "Elyon " + titleCaseKnownWords(itemName);
            }
        },
        {
            pattern: /^ishbaal(.+)$/i,
            replace: function (match, itemName) {
                return "Ishbaal " + titleCaseKnownWords(itemName);
            }
        },
        {
            pattern: /^ishmutianchild'?s(.+)$/i,
            replace: function (match, itemName) {
                return "Ishmutian Child's " + titleCaseKnownWords(itemName);
            }
        },
        {
            pattern: /^skia(.+)$/i,
            replace: function (match, itemName) {
                return "Skia " + titleCaseKnownWords(itemName);
            }
        },
        {
            pattern: /^slave(.+)$/i,
            replace: function (match, itemName) {
                return "Slave " + titleCaseKnownWords(itemName);
            }
        },
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
        ["VHE"],
        ["Apparel"],
        ["Footwear"],
        ["Headgear"],
        ["Handwear"],
        ["Building"],
        ["Relic", "Inert"],
        ["Relic"],
        ["Inert"],
        ["Mawy"],
        ["Industrial"]
    ];

    return removeTagPhrases(name, tagPhrases);
}

function removeTagPhrases(name, tagPhrases) {
    let words = name.split(/\s+/).filter(Boolean);
    let changed = true;

    while (changed) {
        changed = false;

        for (const phrase of tagPhrases) {
            for (let i = 0; i <= words.length - phrase.length; i++) {
                const matches = phrase.every(function (tagWord, offset) {
                    return words[i + offset].toLowerCase() === tagWord.toLowerCase();
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

function removeLeadingFishAnimalTag(name) {
    return name.replace(/^Fish\s+(.+)$/i, "$1").trim();
}

function movePriorityTagsToFront(name) {
    return moveWordsToFront(name, ["Prestige"]);
}

function moveSlaveToFront(name) {
    return moveWordsToFront(name, ["Slave"]);
}

function moveSmallToFront(name) {
    return moveWordsToFront(name, ["Small"]);
}

function moveHatToEnd(name) {
    return moveWordsToEnd(name, ["Hat"]);
}

function moveWordsToFront(name, wordsToMove) {
    let words = name.split(/\s+/).filter(Boolean);
    const foundWords = [];

    for (const wantedWord of wordsToMove) {
        const index = words.findIndex(function (word) {
            return word.toLowerCase() === wantedWord.toLowerCase();
        });

        if (index > 0) {
            foundWords.push(words.splice(index, 1)[0]);
        } else if (index === 0) {
            foundWords.push(words.shift());
        }
    }

    if (foundWords.length === 0) {
        return name;
    }

    return [...foundWords, ...words].join(" ");
}

function moveWordsToEnd(name, wordsToMove) {
    let words = name.split(/\s+/).filter(Boolean);
    const foundWords = [];

    for (const wantedWord of wordsToMove) {
        const index = words.findIndex(function (word) {
            return word.toLowerCase() === wantedWord.toLowerCase();
        });

        if (index !== -1) {
            foundWords.push(words.splice(index, 1)[0]);
        }
    }

    if (foundWords.length === 0) {
        return name;
    }

    return [...words, ...foundWords].join(" ");
}

function moveLeadingTagsToEnd(name) {
    const tagPhrases = [
        ["Animal", "Vaccine"],
        ["Vaccine"],
        ["Targeter"],
        ["Psytrainer"]
    ];

    const words = name.split(/\s+/).filter(Boolean);

    for (const tagWords of tagPhrases) {
        const startsWithTag = tagWords.every(function (tagWord, index) {
            return words[index] && words[index].toLowerCase() === tagWord.toLowerCase();
        });

        if (startsWithTag && words.length > tagWords.length) {
            return [...words.slice(tagWords.length), ...tagWords].join(" ");
        }
    }

    return name;
}

function formatAnimalVaccineName(name) {
    return name
        .replace(/^Animal\s+Vaccine\s+(.+)$/i, "$1 Vaccine (Animal)")
        .replace(/^(.+?)\s+Animal\s+Vaccine$/i, "$1 Vaccine (Animal)")
        .replace(/\s+/g, " ")
        .trim();
}

function reorderEggName(name) {
    const words = name.split(/\s+/);
    const eggIndex = words.findIndex(word => word.toLowerCase() === "egg");
    const statusIndex = words.findIndex(word =>
        word.toLowerCase() === "fertilized" || word.toLowerCase() === "unfertilized"
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
    const words = name.split(/\s+/).filter(Boolean);

    if (words.length < 2) {
        return name;
    }

    const leadingClarifierPhrases = [
        ["Mech", "Serum"],
        ["Nature", "Shrine"]
    ];

    for (const phrase of leadingClarifierPhrases) {
        const startsWithPhrase = phrase.every(function (word, index) {
            return words[index] && words[index].toLowerCase() === word.toLowerCase();
        });

        if (startsWithPhrase && words.length > phrase.length) {
            return [...words.slice(phrase.length), ...phrase].join(" ");
        }
    }

    const leadingClarifiers = new Set([
        "meat",
        "leather",
        "wool",
        "egg",
        "meal",
        "trap",
        "shell",
        "subcore",
        "medicine",
        "pack",
        "sculpture",
        "radiator",
        "blocks",
        "turret",
        "pallet",
        "crown",
        "techprint"
    ]);

    const firstWord = words[0];

    if (leadingClarifiers.has(firstWord.toLowerCase())) {
        return words.slice(1).join(" ") + " " + firstWord;
    }

    return name;
}

function addArtificialFromCommandName(name, rawCommandName) {
    const commandHasArtificial = /artificial/i.test(rawCommandName || "");
    const nameAlreadyHasArtificial = /\bArtificial\b/i.test(name);

    if (commandHasArtificial && !nameAlreadyHasArtificial) {
        return "Artificial " + name;
    }

    return name;
}

function isNanoOrMechaniteSpecial(rawCommandName) {
    return (
        /^nano(vaccine|neutralizer)/i.test(rawCommandName || "") ||
        /^mechanite(stabilizer|neutralizer)/i.test(rawCommandName || "")
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

function isTreatmentPill(rawCommandName) {
    return /treatmentpill$/i.test(rawCommandName || "");
}

function formatTreatmentPill(rawCommandName) {
    return titleCaseKnownWords(
        rawCommandName.replace(/treatmentpill$/i, " treatment pill")
    );
}

function isDbhStuffItem(rawDisplayName, rawCommandName) {
    const displayLooksDbh = /\bDBH\b/i.test(rawDisplayName || "");
    const commandLooksStuff = /(stuff|stuffed)/i.test(rawCommandName || "");

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

function titleCaseKnownWords(text) {
    let spaced = splitKnownSuffix(String(text || ""));
    spaced = normalizeNameSpacing(spaced);

    return spaced
        .split(/\s+/)
        .filter(Boolean)
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
        "stabilizer",
        "stuffed",
        "stuff"
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

function getMismatchedCommandNameOverride(rawDisplayName, rawCommandName) {
    const key = normalizeForNameComparison(rawCommandName);

    const overrides = {
        advancedcomponent: "Advanced Component"
    };

    return overrides[key] || "";
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
