import { ContentWrapper } from "../../components/ContentWrapper";
import { OpenOnStartup } from "./OpenOnStartup";
import { WorkingDirectory } from "./WorkingDirectory";

export function General() {
  return (
    <ContentWrapper value="general" name="General">
      <OpenOnStartup />
      <WorkingDirectory />
    </ContentWrapper>
  )
}
