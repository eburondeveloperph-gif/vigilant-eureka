/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Default Live API model to use
 */
export const DEFAULT_LIVE_API_MODEL =
  'gemini-2.5-flash-native-audio-preview-09-2025';

export const DEFAULT_VOICE = 'Aoede';

export const AVAILABLE_VOICES = ['Zephyr', 'Puck', 'Charon', 'Luna', 'Nova', 'Kore', 'Fenrir', 'Leda', 'Orus', 'Aoede', 'Callirrhoe', 'Autonoe', 'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 'Despina', 'Erinome', 'Algenib', 'Rasalgethi', 'Laomedeia', 'Achernar', 'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima', 'Achird', 'Zubenelgenubi', 'Vindemiatrix', 'Sadachbia', 'Sadaltager', 'Sulafat'];

export const VOICE_PERSONA_ALIASES: Record<string, string> = {
  Zephyr: 'Athena, Strategist Queen',
  Puck: 'Hermes, Silver King',
  Charon: 'Hades, Shadow King',
  Luna: 'Selene, Moon Queen',
  Nova: 'Asteria, Star Goddess',
  Kore: 'Persephone, Spring Queen',
  Fenrir: 'Ares, War King',
  Leda: 'Hera, High Queen',
  Orus: 'Helios, Sun King',
  Aoede: 'Aphrodite, Golden Goddess',
  Callirrhoe: 'Callirrhoe, River Queen',
  Autonoe: 'Artemis, Wild Goddess',
  Enceladus: 'Cronus, Titan King',
  Iapetus: 'Iapetus, Elder King',
  Umbriel: 'Nyx, Night Queen',
  Algieba: 'Rhea, Mother Queen',
  Despina: 'Despoina, Hidden Goddess',
  Erinome: 'Eris, Discord Queen',
  Algenib: 'Orion, Hunter King',
  Rasalgethi: 'Heracles, Lion King',
  Laomedeia: 'Laomedeia, Sea Queen',
  Achernar: 'Poseidon, Sea King',
  Alnilam: 'Apollo, Oracle King',
  Schedar: 'Cassiopeia, Throne Queen',
  Gacrux: 'Hecate, Crossroads Queen',
  Pulcherrima: 'Helen, Radiant Queen',
  Achird: 'Demeter, Harvest Goddess',
  Zubenelgenubi: 'Themis, Justice Queen',
  Vindemiatrix: 'Dionysus, Vine King',
  Sadachbia: 'Ariadne, Labyrinth Queen',
  Sadaltager: 'Agamemnon, Bronze King',
  Sulafat: 'Circe, Enchantress Queen',
};

export const getVoicePersonaLabel = (voice: string) =>
  `${VOICE_PERSONA_ALIASES[voice] || voice} - ${voice}`;
