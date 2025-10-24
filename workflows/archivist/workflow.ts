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

  const messagesText = messages.map(
    (m) =>
      `${m.role}:${m.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("\n")}`
  );

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
      You are a knowledge base archivist. Your task is to extract noteworthy things from the messages and write them to the knowledge base.
      The knowledge base is the game history for a choose your own adventure game.

      <WORLD_INFO>
        Name: ${context.world.name}
        Description: ${context.world.description}
      </WORLD_INFO>
      <PLAYER_INFO>
        Name: ${context.player.name}
        Description: ${context.player.description}
      </PLAYER_INFO>

      You will be given the latest chat message from the player's chat and its up to you to spot anything new or interesting like a rare artifact or new location or character etc.
      
      IMPORTANT: Make sure to not add duplicates to the knowledge base! Always search for duplicates before adding anything new.
      IMPORTANT: Before adding a new character, make sure there is not a player with the same name already in the knowledge base!
      IMPORTANT: You're also in charge of updating things if they have changed! If you find something in the knowledge base but the information is outdated, update it using the appropriate tools.

      If the messages include new places, characters, items, or events, make sure to add them to the knowledge base using the appropriate tools.
      You can add as many things as you want! Remember the more things in our knowledge base the better the story will be!
    `,
    prompt: dedent`
      Here is the latest chat message from the player:

      <GAME MESSAGES>
        ${messagesText.join("\n\n")}
      </GAME MESSAGES>

      Save anything that might be useful for later story telling or for other players to know about.
    `,
  });

  console.log("Archive step completed!");
}
