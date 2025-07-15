import { getTranslation } from "@/features/i18n";

const AnotherServerComponent = async () => {
  const { t } = await getTranslation(["home"]);

  return (
    <div>
      <p className="underline">AnotherServerComponent: </p>
      <p>Nested.test: {t("nested.test")}</p>
      <p>nested.deep.label: {t("home:nested.deep.label")}</p>
    </div>
  );
};

export default AnotherServerComponent;
