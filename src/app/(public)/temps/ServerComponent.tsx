import { getTranslation } from "@/features/i18n";
import AnotherServerComponent from "./AnotherServerComponent";

const ServerComponent = async () => {
  const { t } = await getTranslation(["translation", "home"]);

  return (
    <>
      <div>
        <p className="underline">ServerComponent: </p>
        <p>Title: {t("title")}</p>
        <p>Description: {t("translation:description")}</p>
        <p>Text: {t("home:text")}</p>
      </div>

      <AnotherServerComponent />
    </>
  );
};

export default ServerComponent;
