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
    
    const usingCommandName =
        shouldUseCommandNameAsDisplay(rawDisplayName, rawCommandName) ||
        shouldUseCommandNameForMismatch(rawDisplayName, rawCommandName);
    
    let name = usingCommandName ? rawCommandName : rawDisplayName;

    name = applyManualCommandSpacing(name);
    name = normalizeNameSpacing(name);

    if (usingCommandName) {
        name = restoreCommandPunctuation(name, rawCommandName);
        name = titleCaseKnownWords(name);
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
    name = capitalizePawnKindEntry(name, rawDisplayName, rawCommandName);
    name = applyConfiguredWordMoves(name);
    name = moveSizeQualifiersToEnd(name);
    name = removeDuplicateWords(name);
    name = capitalizeDisplayWords(name);
    
    return finalClean(name);
}

function finalClean(name) {
    return name
        .replace(/\s+/g, " ")
        .replace(/\s+\)/g, ")")
        .replace(/\(\s+/g, "(")
        .replace(/\s+-\s+/g, " - ")
        .replace(/\s+:\s+/g, " : ")
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

function displayNameMatchesCommandNameAfterTagCleanup(rawDisplayName, rawCommandName) {
    if (!rawDisplayName || !rawCommandName) {
        return false;
    }

    let cleanedDisplayName = normalizeNameSpacing(rawDisplayName);
    cleanedDisplayName = removeDisplayOnlyTags(cleanedDisplayName);

    return normalizeForNameComparison(cleanedDisplayName) === normalizeForNameComparison(rawCommandName);
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

    if (isEggItem(rawDisplayName, rawCommandName)) {
        return false;
    }

    if (displayNameMatchesCommandName(rawDisplayName, rawCommandName)) {
        return false;
    }

    return commandNameLooksHumanizable(rawCommandName);
}

function commandNameLooksHumanizable(rawCommandName) {
    const commandName = String(rawCommandName || "");

    return (
        /[_\-\s()'’]/.test(commandName) ||
        /[a-z0-9][A-Z]/.test(commandName) ||
        commandNameHasKnownSuffix(commandName)
    );
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
        isNanoOrMechaniteSpecial(rawDisplayName, rawCommandName) ||
        isTrainerOrTechprint(rawCommandName) ||
        isTreatmentPill(rawCommandName) ||
        shouldUseCommandNameForDbhStuffOrHyphen(rawDisplayName, rawCommandName)
    );
}

function formatSpecialCommandName(rawDisplayName, rawCommandName) {
    if (isNanoOrMechaniteSpecial(rawDisplayName, rawCommandName)) {
        return formatNanoOrMechaniteSpecial(rawDisplayName, rawCommandName);
    }

    if (isTrainerOrTechprint(rawCommandName)) {
        return formatTrainerOrTechprint(rawCommandName);
    }

    if (isTreatmentPill(rawCommandName)) {
        return formatTreatmentPill(rawCommandName);
    }

    if (shouldUseCommandNameForDbhStuffOrHyphen(rawDisplayName, rawCommandName)) {
    return titleCaseKnownWords(rawCommandName);
}

    return titleCaseKnownWords(rawCommandName);
}

function isHarMeatDisplayName(displayName) {
    const normalizedName = normalizeNameSpacing(displayName || "");

    return (
        /^HAR\s+(CO\s+Race|EL\s+Monster|EL\s+Race).*Meat$/i.test(normalizedName) ||
        /^Meat\s+HAR\s+(CO\s+Race|EL\s+Monster|EL\s+Race)/i.test(normalizedName)
    );
}

function isEggBoxName(name, rawCommandName) {
    return (
        /^Egg\s+Box\b/i.test(name) ||
        /eggbox/i.test(rawCommandName || "")
    );
}

function isEggItem(rawDisplayName, rawCommandName) {
    const normalizedName = normalizeNameSpacing(
        [rawDisplayName || "", rawCommandName || ""].join(" ")
    );

    return (
        /\bEgg\b/i.test(normalizedName) ||
        /\bFertilized\b/i.test(normalizedName) ||
        /\bUnfertilized\b/i.test(normalizedName) ||
        /eggbox/i.test(rawCommandName || "") ||

        // Keep ordinary vaccine items on the display-name cleanup path
        /\bAnimal\s+Vaccine\b/i.test(normalizedName) ||
        /\bVaccine\b/i.test(normalizedName)
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
        },
        {
            pattern: /^arachne(.+)$/i,
            replace: function (match, itemName) {
                return "Arachne " + titleCaseKnownWords(itemName);
            }
        },
        {
            pattern: /^ishmutian(.+)$/i,
            replace: function (match, itemName) {
                return "Ishmutian " + titleCaseKnownWords(itemName);
            }
        },
        {
            pattern: /^prestige(.+)$/i,
            replace: function (match, itemName) {
                return "Prestige " + titleCaseKnownWords(itemName);
            }
        },
        {
            pattern: /^dragonian(.+)$/i,
            replace: function (match, itemName) {
                return "Dragonian " + titleCaseKnownWords(itemName);
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
        ["MVE"],
        ["MEV"],
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
        ["Weapon"],
        ["Relic", "Inert"],
        ["Relic"],
        ["Inert"],
        ["Mawy"],
        ["Industrial"],
        ["Log"]
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

function applyConfiguredWordMoves(name) {
    const moves = [
        { direction: "front", words: ["Slave"] },
        { direction: "front", words: ["Small"] },
        { direction: "end", words: ["Meat"] },
        { direction: "end", words: ["Armor", "Helmet"] },
        { direction: "end", words: ["Hat"] },
        { direction: "end", words: ["Targeter"] },
        { direction: "front", words: ["Unique"] },
        { direction: "end", words: ["Soup"] }
    ];

    for (const move of moves) {
        if (move.direction === "front") {
            name = moveWordsToFront(name, move.words);
        }

        if (move.direction === "end") {
            name = moveWordsToEnd(name, move.words);
        }
    }

    return name;
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
        ["Vaccine"]
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
        "cat",
        "wolf",
        "bear",
        "fox",
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
        "soup"
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

function isNanoOrMechaniteSpecial(rawDisplayName, rawCommandName) {
    const cleanedDisplayName = removeDisplayOnlyTags(normalizeNameSpacing(rawDisplayName || ""));
    const haystack = [rawCommandName || "", cleanedDisplayName].join(" ");

    return /(nano[-_\s]*vaccine|archo[-_\s]*vaccine|mechanite[-_\s]*neutralizer|mechanite[-_\s]*stabilizer)/i.test(haystack);
}

function formatNanoOrMechaniteSpecial(rawDisplayName, rawCommandName) {
    const cleanedDisplayName = removeDisplayOnlyTags(normalizeNameSpacing(rawDisplayName || ""));
    const commandSource = String(rawCommandName || "").trim();
    const displaySource = String(cleanedDisplayName || "").trim();

    return (
        formatSpecialMedicalItemFromSource(commandSource) ||
        formatSpecialMedicalItemFromSource(displaySource) ||
        titleCaseKnownWords(commandSource || displaySource)
    );
}

function formatSpecialMedicalItemFromSource(source) {
    const raw = String(source || "").trim();

    const patterns = [
        {
            pattern: /^nano[-_\s]*vaccine(?:\((.+?)\)|[-_\s]*(.+))?$/i,
            label: "NanoVaccine"
        },
        {
            pattern: /^archo[-_\s]*vaccine(?:\((.+?)\)|[-_\s]*(.+))?$/i,
            label: "ArchoVaccine"
        },
        {
            pattern: /^mechanite[-_\s]*neutralizer(?:\((.+?)\)|[-_\s]*(.+))?$/i,
            label: "Mechanite Neutralizer"
        },
        {
            pattern: /^mechanite[-_\s]*stabilizer(?:\((.+?)\)|[-_\s]*(.+))?$/i,
            label: "Mechanite Stabilizer"
        }
    ];

    for (const item of patterns) {
        const match = raw.match(item.pattern);

        if (!match) {
            continue;
        }

        const purpose = cleanSpecialPurpose(match[1] || match[2] || "");

        if (!purpose) {
            return item.label;
        }

        return item.label + " - " + purpose;
    }

    return "";
}

function cleanSpecialPurpose(purpose) {
    return titleCaseKnownWords(String(purpose || "")
        .replace(/^[_\s-]+/, "")
        .replace(/[_\s-]+$/, "")
    );
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

function shouldUseCommandNameForDbhStuffOrHyphen(rawDisplayName, rawCommandName) {
    if (!rawDisplayName || !rawCommandName) {
        return false;
    }

    const haystack = [rawDisplayName, rawCommandName].join(" ");

    const looksDbh =
        /\bDBH\b/i.test(haystack) ||
        /Dub'?s\s+Bad\s+Hygiene/i.test(haystack) ||
        /\bdubs/i.test(haystack);

    const hasStuffOrHyphen =
        /\bstuff(ed)?\b/i.test(rawDisplayName) ||
        /stuff(ed)?/i.test(rawCommandName) ||
        /-/.test(rawDisplayName) ||
        /-/.test(rawCommandName);

    if (!looksDbh || !hasStuffOrHyphen) {
        return false;
    }

    return !displayNameMatchesCommandNameAfterTagCleanup(rawDisplayName, rawCommandName);
}

function displayNameMatchesCommandNameAfterTagCleanup(rawDisplayName, rawCommandName) {
    let cleanedDisplayName = normalizeNameSpacing(rawDisplayName);
    cleanedDisplayName = removeDisplayOnlyTags(cleanedDisplayName);

    return normalizeForNameComparison(cleanedDisplayName) === normalizeForNameComparison(rawCommandName);
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

function removeDuplicateWords(name) {
    const words = name.split(/\s+/).filter(Boolean);
    const cleanedWords = [];

    for (const word of words) {
        const previousWord = cleanedWords[cleanedWords.length - 1];

        if (previousWord && previousWord.toLowerCase() === word.toLowerCase()) {
            continue;
        }

        cleanedWords.push(word);
    }

    return cleanedWords.join(" ");
}

function moveSizeQualifiersToEnd(name) {
    const compactMatch = name.match(/^(.*?)(1x1|1x2|2x2|2x4|3x3)c?$/i);

    if (compactMatch && compactMatch[1].trim()) {
        const base = titleCaseKnownWords(compactMatch[1]);
        const suffix = /c$/i.test(name) ? " c" : "";
        const size = compactMatch[2].toLowerCase();

        return base + suffix + " (" + size + ")";
    }

    const words = name.split(/\s+/).filter(Boolean);
    const sizeIndex = words.findIndex(function (word) {
        return /^(Broad|Medium|1x1|1x2|2x2|2x4|3x3)$/i.test(word);
    });

    if (sizeIndex === -1) {
        return name;
    }

    const size = words.splice(sizeIndex, 1)[0];
    const formattedSize = /x/i.test(size) ? size.toLowerCase() : capitalizeFirstLetter(size);

    return words.join(" ") + " (" + formattedSize + ")";
}

function commandNameHasKnownSuffix(rawCommandName) {
    const commandName = String(rawCommandName || "").toLowerCase();

    const knownSuffixes = [
        "advancedcomponent",
        "component",
        "treatmentpill",
        "medicine",
        "neutralizer",
        "stabilizer",
        "vaccine",
        "stuffed",
        "stuff",
        "table",
        "chair",
        "bed",
        "door",
        "wall",
        "floor",
        "lamp",
        "light",
        "helmet",
        "armor",
        "shirt",
        "pants",
        "vest",
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
        "strap",
        "blouse",
        "dress",
        "pill",
        "meat",
        "leather",
        "wool",
        "egg",
        "leaves",
        "veil",
        "rack",
        "vacsuit",
        "suit",
        "shield",
        "t-shirt",
        "bench",
        "torch",
        "coffee",
        "beans",
        "sublink",
        "mech",
        "sauna"
    ];

    return knownSuffixes.some(function (suffix) {
        return commandName.endsWith(suffix) && commandName.length > suffix.length;
    });
}

function splitKnownSuffix(text) {
    const knownSuffixes = [
        "advancedcomponent",
        "component",
        "medicine",
        "treatmentpill",
        "bodystrap",
        "neutralizer",
        "stabilizer",
        "vaccine",
        "stuffed",
        "stuff",
        "table",
        "chair",
        "bed",
        "door",
        "wall",
        "floor",
        "lamp",
        "light",
        "helmet",
        "armor",
        "shirt",
        "pants",
        "vest",
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
        "strap",
        "blouse",
        "dress",
        "pill",
        "leaves",
        "veil",
        "rack",
        "vacsuit",
        "suit",
        "shield",
        "t-shirt",
        "bench",
        "torch",
        "coffee",
        "beans",
        "sublink",
        "mech",
        "sauna"
    ];

    let remaining = String(text || "");
    const suffixParts = [];
    let changed = true;

        while (changed) {
            changed = false;
    
            const lowerText = remaining.toLowerCase();
    
            for (const suffix of knownSuffixes) {
                if (lowerText === suffix) {
                    continue;
                }
    
                if (lowerText.endsWith(suffix) && remaining.length > suffix.length) {
                    const firstPart = remaining.slice(0, remaining.length - suffix.length);
                    const lastPart = remaining.slice(remaining.length - suffix.length);
    
                    remaining = firstPart;
                    suffixParts.unshift(lastPart);
                    changed = true;
                    break;
                }
            }
        }

        return [remaining, ...suffixParts]
            .filter(Boolean)
            .join(" ");
}

function restoreCommandPunctuation(name, rawCommandName) {
    if (!rawCommandName) {
        return name;
    }

    if (rawCommandName.includes("-")) {
        name = rawCommandName
            .replace(/_/g, " ")
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
            .replace(/\s+/g, " ")
            .trim();

        return titleCaseKnownWords(name);
    }

    if (rawCommandName.includes("'") || rawCommandName.includes("’")) {
        name = rawCommandName
            .replace(/_/g, " ")
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
            .replace(/\s+/g, " ")
            .trim();

        return titleCaseKnownWords(name);
    }

    return name;
}

function capitalizePawnKindEntry(name, rawDisplayName, rawCommandName) {
    const isPawnKind = /pawn\s*kind|pawnkind|pawn\s*type|pawntype/i.test(
        [rawDisplayName, rawCommandName].join(" ")
    );

    if (!isPawnKind) {
        return name;
    }

    return titleCaseKnownWords(name);
}

function capitalizeFirstLetter(word) {
    if (!word) {
        return word;
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function capitalizeDisplayWords(name) {
    return String(name || "")
        .split(/\s+/)
        .filter(Boolean)
        .map(capitalizeDisplayToken)
        .join(" ");
}

function capitalizeDisplayToken(token) {
    return String(token || "").replace(/^([("'[]*)([a-z])/, function (match, prefix, letter) {
        return prefix + letter.toUpperCase();
    });
}

function getMismatchedCommandNameOverride(rawDisplayName, rawCommandName) {
    const key = normalizeForNameComparison(rawCommandName);

    const overrides = {
        meathook: "Meat Hook",
        cannedeggs: "Canned Eggs",
        shirtandtie: "Shirt and Tie",
        trenchgun: "Trenchgun",
        wasteleather: "Waste Leather",
        eltselem: "Eltselem (Incubator)",
        hood: "Hood",
        veil: "Veil",
        tribalwear: "Tribalwear",
        casualtshirt: "Casual T-Shirt"
        
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
