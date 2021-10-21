import Newspaper from './newspaper.type';
import { plainToClass } from 'class-transformer';
const loadNewspaper = (): Newspaper[] => {
  return plainToClass(Newspaper, [
    {
      _id: 1,
      page: [[23,24,20,21,22,19, 18, 17], [20,21,22], [19, 18], [17]],
      status: 1,
      name: "08 2021",
      url: "2021_8.pdf",
      total_page: 34
    },
    {
      _id: 2,
      page: [[17], [20,21,22], [19, 18], [23,24]],
      status: 1,
      name: "07 2021",
      url: "2021_7.pdf",
      total_page: 34
    }
  ]);
};

export default loadNewspaper;
