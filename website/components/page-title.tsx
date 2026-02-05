import { Breadcrumb } from "./ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const PageTitleComponent = ({
  title,
  breadcrumbItems,
}: {
  title: string;
  breadcrumbItems: BreadcrumbItem[];
}) => {
  return (
    <div className="container mx-auto max-w-6xl my-8">
      <Breadcrumb items={breadcrumbItems} className="mb-3" />
      {/* <h1 className="text-2xl font-semibold text-slate-900">{title}</h1> */}
    </div>
  );
};

export default PageTitleComponent;
