//import { MidiParser } from "https://cdn.jsdelivr.net/npm/midi-parser-js@4.0.4/src/main.min.js";
import { MidiParser } from "https://unpkg.com/midi-parser-js@4.0.4/src/midi-parser.js";
console.log("Loaded module script");
window.MidiParser = MidiParser; // Hack to export midiparser
