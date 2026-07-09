function humanizeStoreName(text, commandName, modName) {
    if (!text) {
        return "";
    }

    const rawDisplayName = text.trim();
    const rawCommandName = (commandName || "").trim();
    const rawModName = (modName || "").trim();

    const specificDisplayName = formatSpecificDisplayName(rawDisplayName);
    if (specificDisplayName) {
        return finalClean(specificDisplayName);
    }

    const useCommandName = shouldUseCommandNameForDisplay(rawDisplayName, rawCommandName, rawModName);

    let name = useCommandName
        ? formatNameFromCommand(rawCommandName, rawDisplayName, rawModName)
        : formatNameFromDisplay(rawDisplayName, rawCommandName, rawModName);

    name = applySharedFinalRules(name, rawDisplayName, rawCommandName, rawModName);

    return finalClean(name);
}

function formatNameFromDisplay(rawDisplayName, rawCommandName, rawModName) {
    let name = applyManualCommandSpacing(rawDisplayName);
    name = normalizeNameSpacing(name);
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

    return name;
}

function formatNameFromCommand(rawCommandName, rawDisplayName, rawModName) {
    if (isNanoOrMechaniteSpecial(rawCommandName)) {
        return formatNanoOrMechaniteSpecial(rawCommandName);
    }

    if (isTrainerOrTechprint(rawCommandName)) {
        return formatTrainerOrTechprint(rawCommandName);
    }

    if (isTreatmentPill(rawCommandName)) {
        return formatTreatmentPill(rawCommandName);
    }

    if (isDragonianEntry(rawDisplayName, rawCommandName, rawModName)) {
        return formatDragonianCommandName(rawCommandName, rawDisplayName, rawModName);
    }

    if (isMiliraEntry(rawDisplayName, rawCommandName, rawModName)) {
        return formatMiliraCommandName(rawCommandName, rawDisplayName, rawModName);
    }

    return formatCommandNameWithSpacing(rawCommandName);
}

function formatCommandNameWithSpacing(rawCommandName) {
    let name = applyManualCommandSpacing(rawCommandName);

    if (name !== rawCommandName) {
        return name;
    }

    name = expandKnownCommandTokens(rawCommandName);
    name = titleCaseKnownWords(name);

    return fixKnownCapitalization(name);
}

function expandKnownCommandTokens(rawCommandName) {
    let name = String(rawCommandName || "");

    const knownTokens = [
        "vanilla",
        "expanded",
        "royalty",
        "odyssey",
        "dubs",
        "dub",
        "bad",
        "hygiene",
        "central",
        "heating",
        "hotspring",
        "hotsprings",
        "lwm",
        "deep",
        "storage",
        "arachne",
        "milira",
        "milian",
        "dragonian",
        "grenade",
        "grenades",
        "armor",
        "helmet",
        "helment",
        "targeter",
        "table",
        "small",
        "broad",
        "medium",
        "large",
        "male",
        "both",
        "permit",
        "class",
        "letter",
        "plate"
    ];

    for (const token of knownTokens) {
        const pattern = new RegExp(token, "ig");
        name = name.replace(pattern, " " + token + " ");
    }

    return name
        .replace(/\s+/g, " ")
        .trim();
}

function applySharedFinalRules(name, rawDisplayName, rawCommandName, rawModName) {
    name = normalizeNameSpacing(name);
    name = removeDisplayOnlyTags(name);
    name = removeLeadingFishAnimalTag(name);
    name = formatAnimalVaccineName(name);
    name = addArtificialFromCommandName(name, rawCommandName);
    name = capitalizePawnKindEntry(name, rawDisplayName, rawCommandName);
    name = movePriorityTagsToFront(name);
    name = moveSlaveToFront(name);
    name = moveSmallToFront(name);
    name = moveArmorHelmetToEnd(name);
    name = moveHatToEnd(name);
    name = moveUniqueToFront(name);
    name = moveTargeterToEnd(name);
    name = moveSizeQualifiersToEnd(name);
    name = removeDuplicateWords(name);
    name = fixKnownCapitalization(name);
    name = capitalizeSingleWordEvelietName(name, rawDisplayName, rawModName);

    return name;
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
    return String(name || "")
        .replace(/_+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();
}

function shouldUseCommandNameForDisplay(rawDisplayName, rawCommandName, rawModName) {
    if (!rawCommandName) {
        return false;
    }

    return (
        rawDisplayName.startsWith("HAR") ||
        rawDisplayName.startsWith("Aya") ||
        hasSpecialCommandSyntax(rawCommandName) ||
        isTableEntry(rawDisplayName, rawCommandName) ||
        isArachneArmorOrHelmet(rawDisplayName, rawCommandName, rawModName) ||
        isMiliraEntry(rawDisplayName, rawCommandName, rawModName) ||
        isDragonianEntry(rawDisplayName, rawCommandName, rawModName) ||
        isGrenadeEntry(rawDisplayName, rawCommandName) ||
        isDubEntry(rawDisplayName, rawCommandName, rawModName) ||
        isRoyaltyOrOdysseyEntry(rawDisplayName, rawCommandName, rawModName) ||
        isHotspringEntry(rawDisplayName, rawCommandName, rawModName) ||
        isLwmDeepStorageEntry(rawDisplayName, rawCommandName, rawModName) ||
        isNanoOrMechaniteSpecial(rawCommandName) ||
        isTrainerOrTechprint(rawCommandName) ||
        isTreatmentPill(rawCommandName) ||
        isDbhStuffItem(rawDisplayName, rawCommandName)
    );
}

function hasSpecialCommandSyntax(rawCommandName) {
    return /['-]/.test(rawCommandName || "");
}

function isTableEntry(rawDisplayName, rawCommandName) {
    return Boolean(
        rawCommandName &&
        (
            /\bTable\b/i.test(rawDisplayName) ||
            /table/i.test(rawCommandName)
        )
    );
}

function isArachneArmorOrHelmet(rawDisplayName, rawCommandName, rawModName) {
    const haystack = [rawDisplayName, rawCommandName, rawModName].join(" ");
    return /arachne/i.test(haystack) && /(armor|helmet|helment)/i.test(haystack);
}

function isMiliraEntry(rawDisplayName, rawCommandName, rawModName) {
    return /milira|milian/i.test([rawDisplayName, rawCommandName, rawModName].join(" "));
}

function isDragonianEntry(rawDisplayName, rawCommandName, rawModName) {
    return /dragonian/i.test([rawDisplayName, rawCommandName, rawModName].join(" "));
}

function isGrenadeEntry(rawDisplayName, rawCommandName) {
    return /grenade/i.test([rawDisplayName, rawCommandName].join(" "));
}

function isDubEntry(rawDisplayName, rawCommandName, rawModName) {
    return /(dub'?s?\s+(bad\s+hygiene|central\s+heating)|DBH|bad\s+hygiene|central\s+heating)/i.test(
        [rawDisplayName, rawCommandName, rawModName].join(" ")
    );
}

function isRoyaltyOrOdysseyEntry(rawDisplayName, rawCommandName, rawModName) {
    return /\b(Royalty|Odyssey)\b/i.test([rawDisplayName, rawCommandName, rawModName].join(" "));
}

function isHotspringEntry(rawDisplayName, rawCommandName, rawModName) {
    return /hotspring/i.test([rawDisplayName, rawCommandName, rawModName].join(" "));
}

function isLwmDeepStorageEntry(rawDisplayName, rawCommandName, rawModName) {
    return /(LWM\s+Deep\s+Storage|Deep\s+Storage)/i.test([rawDisplayName, rawCommandName, rawModName].join(" "));
}

function formatSpecificDisplayName(rawDisplayName) {
    const dossierMatch = rawDisplayName.match(/^Milira\s+Information\s+Letter\s*\|\s*Milian\s+Class\s+(.+)$/i);
    if (dossierMatch) {
        return "Milira Church Dossier : " + titleCaseKnownWords(dossierMatch[1]);
    }

    const permitMatch = rawDisplayName.match(/^Milian\s+Name\s+Plate\s+(.+)$/i);
    if (permitMatch) {
        return "Milian Class Permit : " + titleCaseKnownWords(permitMatch[1]);
    }

    return "";
}

function formatMiliraCommandName(rawCommandName, rawDisplayName, rawModName) {
    let name = titleCaseKnownWords(rawCommandName);

    if (!/\b(Milira|Milian)\b/i.test(name)) {
        name = "Milira " + name;
    }

    return name;
}

function formatDragonianCommandName(rawCommandName, rawDisplayName, rawModName) {
    let name = titleCaseKnownWords(rawCommandName);

    if (!/\bDragonian\b/i.test(name)) {
        name = "Dragonian " + name;
    }

    name = moveWordsToFront(name, ["Dragonian"]);
    name = moveGenderQualifierToParentheses(name);

    return name;
}

function moveGenderQualifierToParentheses(name) {
    const words = name.split(/\s+/).filter(Boolean);
    const index = words.findIndex(function (word) {
        return /^(Male|Both)$/i.test(word);
    });

    if (index === -1) {
        return name;
    }

    const gender = capitalizeFirstLetter(words.splice(index, 1)[0]);
    return words.join(" ") + " (" + gender + ")";
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
        ["Industrial"],
        ["MEV"]
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

function moveArmorHelmetToEnd(name) {
    return moveWordsToEnd(name, ["Armor", "Helmet", "Helment"]);
}

function moveHatToEnd(name) {
    return moveWordsToEnd(name, ["Hat"]);
}

function moveUniqueToFront(name) {
    return moveWordsToFront(name, ["Unique"]);
}

function moveTargeterToEnd(name) {
    return moveWordsToEnd(name, ["Targeter"]);
}

function moveWordsToFront(name, wordsToMove) {
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
        "techprint",
        "cat",
        "wolf",
        "bear",
        "fox",
        "bow",
        "giraffe",
        "soup",
        "pangolin",
        "hedgehog",
        "meat",
        "leather",
        "targeter",
        "helmet"
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

function capitalizePawnKindEntry(name, rawDisplayName, rawCommandName) {
    const isPawnKind = /pawn\s*kind|pawnkind/i.test([rawDisplayName, rawCommandName].join(" "));

    if (!isPawnKind) {
        return name;
    }

    return titleCaseKnownWords(name);
}

function capitalizeSingleWordEvelietName(name, rawDisplayName, rawModName) {
    const isEveliet = /\bHAR\b|\bAya\b|Eveliet/i.test([rawDisplayName, rawModName].join(" "));
    const isSingleWord = /^[a-z]+$/i.test(name);

    if (isEveliet && isSingleWord) {
        return capitalizeFirstLetter(name);
    }

    return name;
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
    const compactMatch = name.match(/^(.*?)(1x2|2x2|2x4|3x3)c?$/i);

    if (compactMatch && compactMatch[1].trim()) {
        const base = titleCaseKnownWords(compactMatch[1]);
        const size = compactMatch[2].toLowerCase();
        return base + " (" + size + ")";
    }

    const words = name.split(/\s+/).filter(Boolean);
    const sizeIndex = words.findIndex(function (word) {
        return /^(Broad|Medium|1x2|2x2|2x4|3x3)$/i.test(word);
    });

    if (sizeIndex === -1) {
        return name;
    }

    const size = words.splice(sizeIndex, 1)[0];
    const formattedSize = /x/i.test(size) ? size.toLowerCase() : capitalizeFirstLetter(size);

    return words.join(" ") + " (" + formattedSize + ")";
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
        "grenades",
        "grenade",
        "body",
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

    return String(word)
        .split("-")
        .map(function (part) {
            if (!part) {
                return part;
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("-");
}
function fixKnownCapitalization(name) {
    const replacements = [
        ["Lwm", "LWM"],
        ["Dbh", "DBH"],
        ["Mev", "MEV"],
        ["Vae", "VAE"],
        ["Vpe", "VPE"],
        ["Vwe", "VWE"],
        ["Vbe", "VBE"],
        ["Vce", "VCE"],
        ["Vrea", "VREA"],
        ["Aexp", "AEXP"],
        ["Bmot", "BMOT"],
        ["Sbc", "SBC"],
        ["Dp", "DP"],
        ["At", "AT"],
        ["Har", "HAR"],
        ["Co", "CO"],
        ["El", "EL"],
        ["Dubs", "Dub's"],
        ["Dub", "Dub's"],
        ["Geryymons", "Geryymon's"],
        ["Geryymon", "Geryymon's"]
    ];

    let fixedName = name;

    for (const replacement of replacements) {
        const from = replacement[0];
        const to = replacement[1];
        const pattern = new RegExp("\\b" + escapeRegExp(from) + "\\b", "g");
        fixedName = fixedName.replace(pattern, to);
    }

    return fixedName;
}

function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getModNameForElement(element) {
    if (element.dataset.modName) {
        return element.dataset.modName;
    }

    const cell = element.closest("td");
    if (!cell) {
        return "";
    }

    const metadataSpans = cell.querySelectorAll(".metadata");
    for (const span of metadataSpans) {
        const text = span.textContent.trim();
        const match = text.match(/^From\s+(.+)$/i);

        if (match) {
            return match[1].trim();
        }
    }

    return "";
}

window.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".store-display-name").forEach(function (element) {
        const displayName = element.textContent.trim();
        const commandName = element.dataset.commandName || "";
        const modName = getModNameForElement(element);

        if (isHarMeatDisplayName(displayName) && commandName) {
            element.textContent = humanizeStoreName(commandName, "", modName);
            return;
        }

        element.textContent = humanizeStoreName(displayName, commandName, modName);
    });
});
