import { generateText } from "ai";
import dedent from "dedent";
import { uuidv4 } from "zod/v4";
import { put } from "@vercel/blob";

export const generateImage = async (prompt: string) => {
  const result = await generateText({
    model: "google/gemini-2.5-flash-image-preview",
    providerOptions: {
      google: { responseModalities: ["IMAGE"] },
    },
    prompt: dedent`
      Generate a realistic photo image of the following for my DND game:
      ${prompt}

      (Dont include any text in the image, make it look like a photo)
    `,
  });

  if (result.text) {
    console.log(result.text);
  }

  // Save generated images to local filesystem
  const imageFiles = result.files.filter((f) =>
    f.mediaType?.startsWith("image/")
  );

  if (imageFiles.length === 0) {
    throw new Error("No image files found");
  }

  const image = imageFiles[0].uint8Array;

  const path = `/images/${uuidv4()}.png`;

  const uploadedImage = await put(path, Buffer.from(image), {
    access: "public",
    contentType: "image/png",
  });

  return uploadedImage.url;
};
