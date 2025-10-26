import { UIMessage } from "@ai-sdk/react";
import { worlds } from "@/lib/db/schema";
import { players } from "@/lib/db/schema";
import { Experimental_Agent as Agent, stepCountIs } from "ai";
import dedent from "dedent";
import { getReadTools } from "../../lib/ai/knowledge/tools/readTools";
import { getWriteTools } from "../../lib/ai/knowledge/tools/writeTools";

export async function saveHistoryToKnowledgeBase(
  context: {
    world: typeof worlds.$inferSelect;
    player: typeof players.$inferSelect;
  },
  messages: UIMessage[]
) {
  "use workflow";

  await saveHistoryToKnowledgeBaseStep(
    {
      world: context.world,
      player: context.player,
    },
    messages
  );
}

async function saveHistoryToKnowledgeBaseStep(
  context: {
    world: typeof worlds.$inferSelect;
    player: typeof players.$inferSelect;
  },
  messages: UIMessage[]
) {
  "use step";

  const agent = new Agent({
    tools: {
      ...getReadTools(context.world, context.player),
      ...getWriteTools(context.world, context.player),
    },
    model: "anthropic/claude-haiku-4.5",
    stopWhen: stepCountIs(40),
  });

  await agent.generate({
    system: dedent`
      You are a knowledge base archivist for a choose-your-own-adventure game. Extract and organize noteworthy information from chat messages into the game's knowledge base.

      ## Context
      <WORLD_INFO>
        Name: ${context.world.name}
        Description: ${context.world.description}
      </WORLD_INFO>
      <PLAYER_INFO>
        Name: ${context.player.name}
        Description: ${context.player.description}
      </PLAYER_INFO>

      ## Core Responsibilities
      1. **Extract**: Identify new locations, characters, items, and events from messages
      2. **Deduplicate**: Always search existing knowledge before adding anything new
      3. **Update**: Modify existing entries when information changes
        3.1. Dont include the story in descriptions of entities, add events instead.
        3.2 Update entities to include the latest information, remove any information that is no longer relevant or old.
      4. **Merge**: Combine duplicate entries when found. This is especially important for characters and players.
        4.1. If you find a character that is the same person as a player, merge the character into the player using the mergeCharacterIntoPlayer tool.
        4.2 If you find two characters that are the same in story terms, merge them into one using the mergeCharacters tool.
            For example "The Teacher" and "Mr Brian The Teacher" are the same character and should be merged into one.

      ## Critical Rules
      - **No Duplicates**: Search thoroughly before creating new entries
      - **Character vs Player**: Never create characters that are actually players; use mergeCharacterIntoPlayer instead
      - **Name Updates**: Update unnamed characters when they receive names (e.g., "The elder" → "Elder Marcus")
      - **Focus Scope**: Process only the latest 2 messages (others provided for context)

      ## What to Archive
      - New locations, characters, items, and events
      - Changes to existing entities
        - Dont include every step of the story in descriptions. 
        - Descriptions should include the current state of the entity plus some background information like the origin of the entity.
      - Player status updates (death, new abilities, etc.)
      - Any information useful for storytelling or other players

      Remember: A richer knowledge base creates better stories!
    `,
    prompt: dedent`
      Process these chat messages for knowledge base updates:

      <GAME MESSAGES>
        ${messages
          .map(
            (m) =>
              `<${m.role}>${m.parts
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("\n")}</${m.role}>`
          )
          .join("\n")}
      </GAME MESSAGES>

      Focus on the latest 2 messages. Extract any new information, update existing entries, and ensure no duplicates are created.
    `,
  });

  console.log("Archive step completed!");
}
