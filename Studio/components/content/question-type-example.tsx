import { TChannelQuizContentType } from "@/types/channel-content-quiz";
import { Input } from "../ui/input";

type TExampleQuestionTemplateProps = {
  type: TChannelQuizContentType;
};

export default function ExampleQuestionTemplate({
  type,
}: TExampleQuestionTemplateProps) {
  switch (type) {
    case "multiple_choice": {
      return (
        <div>
          <h3 className="font-medium mb-4">Multiple Choice</h3>
          <div className="p-4 border rounded-md bg-background">
            <div className="mb-3 font-medium">
              What is the capital of France?
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="radio" name="preview" id="paris" />
                <label htmlFor="paris">Paris</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" name="preview" id="london" />
                <label htmlFor="london">London</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" name="preview" id="berlin" />
                <label htmlFor="berlin">Berlin</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" name="preview" id="madrid" />
                <label htmlFor="madrid">Madrid</label>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "fill_in_the_blank": {
      return (
        <div>
          <h3 className="font-medium mb-4">Fill in the Blank</h3>
          <div className="p-4 border rounded-md bg-background">
            <div className="flex items-end font-medium gap-1">
              <span>The capital of France is</span>
              <input
                className="w-[5.5rem] px-1 bg-transparent border-b-2 border-foreground italic focus-visible:border-b-2 focus-visible:outline-none"
                type="text"
                placeholder="Fill in here"
              />
              <span>.</span>
            </div>
          </div>
        </div>
      );
    }

    case "true_false": {
      return (
        <div>
          <h3 className="font-medium mb-4">True/False</h3>
          <div className="p-4 border rounded-md bg-background">
            <div className="mb-3 font-medium">
              Paris is the capital of France.
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="radio" name="preview" id="true" />
                <label htmlFor="true">True</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" name="preview" id="false" />
                <label htmlFor="false">False</label>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "matching": {
      return (
        <div>
          <h3 className="font-medium mb-4">Matching</h3>
          <div className="p-4 border rounded-md bg-background">
            <span className="mb-3 font-medium">
              Match the capitals with their countries.
            </span>
            <div className="flex flex-col items-stretch gap-2 px-2 mt-4 mb-2">
              <div className="flex flex-row items-center gap-2">
                <span className="bg-muted px-2 py-1 rounded-md text-sm">
                  France
                </span>
                <div className="flex-1 border-b-2 border-dashed border-muted" />
                <span className="bg-muted px-2 py-1 rounded-md text-sm">
                  Paris
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <span className="bg-muted px-2 py-1 rounded-md text-sm">
                  Iran
                </span>
                <div className="flex-1 border-b-2 border-dashed border-muted" />
                <span className="bg-muted px-2 py-1 rounded-md text-sm">
                  Tehran
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <span className="bg-muted px-2 py-1 rounded-md text-sm">
                  Washington
                </span>
                <div className="flex-1 border-b-2 border-dashed border-muted" />
                <span className="bg-muted px-2 py-1 rounded-md text-sm">
                  USA
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "short_answer": {
      return (
        <div>
          <h3 className="font-medium mb-4">Short Answer</h3>
          <div className="p-4 border rounded-md bg-background">
            <span className="font-medium">What is the capital of France?</span>
            <Input
              className="w-full mt-3 mb-1"
              placeholder="Enter your short answer here"
            />
          </div>
        </div>
      );
    }
  }
}
