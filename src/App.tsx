import { FC, useCallback, useMemo, useState } from "react";
import { Button, Flex, InputNumber, Select, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  IDataSource,
  IOption,
  ISelectChangeParams,
  ISelectOpenParams,
} from "./types.ts";
import css from "./App.module.css";

const Option = Select.Option;

export const App: FC = () => {
  const [rowCount, setRowCount] = useState<number>(2);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [openedCellData, setOpenedCellData] = useState<IOption | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, IOption>
  >({});
  const [rowCountInputValue, setRowCountInputValue] = useState<string | null>(
    "",
  );
  const [options, setOptions] = useState<IOption[]>([]);

  /**
   * Обрабатывает изменение значения в поле поиска опций
   */
  const onSearch = (value: string) => {
    setSearchValue(value);
    setErrorId(null);
  };

  /**
   * Обрабатывает изменение значения в поле ввода количества строк
   */
  const handleInputChange = (value: string | null = "0") => {
    setRowCountInputValue(value);
  };

  /**
   * Добавляет строки в таблицу
   */
  const addRow = () => {
    setRowCount(rowCount + Number(rowCountInputValue));
  };

  /**
   * Сохраняет выбранные опции
   */
  const handleSave = () => {
    console.log("selectedOptions", [...Object.values(selectedOptions)]);
  };

  /**
   * Добавляет опцию в список
   */
  const handleAddOption = (parentId: string | null) => {
    if (!searchValue.match(/^\d+\.\d+$/)) {
      setErrorId(openedCellData?.id || "");
      return;
    }

    setOptions([
      ...options,
      {
        id: searchValue,
        parentId: parentId,
      },
    ]);
    setSearchValue("");
  };

  /**
   * Возвращает отфильтрованный список опций для выпадающего списка
   */
  const getFilteredOptions = useCallback(
    (openedCell: IOption | null) => {
      const openedCellParentId = openedCell?.parentId;

      const filteredOptions = options.filter((option) => {
        const optionParentId = option.parentId;

        if (!openedCellParentId) {
          return true;
        }

        if (selectedOptions[openedCellParentId]) {
          return optionParentId === selectedOptions[openedCellParentId].id;
        } else {
          return true;
        }
      });

      return filteredOptions.map((option, index) => {
        return (
          <Option
            data-parentid={option.parentId}
            key={option.id + index}
            value={option.id}
          >
            {option.id}
          </Option>
        );
      });
    },
    [options, selectedOptions],
  );

  /**
   * Формируем отфильтрованный список опций для выпадающего списка
   */
  const filteredOptions = useMemo(
    () => getFilteredOptions(openedCellData),
    [getFilteredOptions, openedCellData],
  );

  /**
   * Обрабатывает изменения селекта
   * @param value - выбранное значение
   * @param cellId - уникальный id ячейки в формате "level.row"
   */
  const handleSelectChange = ({ value, cellId }: ISelectChangeParams) => {
    const [level, row] = cellId.split(".").map(Number);
    const _selectedOptions = { ...selectedOptions };

    _selectedOptions[cellId] = options.find(
      (option) => option.id === value,
    ) as IOption;

    Object.keys(_selectedOptions).forEach((key) => {
      const [valueLevel, valueRow] = key.split(".").map(Number);
      if (valueLevel > level && valueRow === row && key !== cellId) {
        delete _selectedOptions[key];
      }
    });

    setSelectedOptions(_selectedOptions);
    setErrorId(null);
  };

  /**
   * Устанавливает открытую ячейку
   * @param open - открыта или закрыта ячейка
   * @param cellId - уникальный id ячейки в формате "level.row"
   * @param parentId - уникальный id родительской ячейки в формате "level.row"
   */
  const handleOpen = (
    open: boolean,
    { cellId, parentId }: ISelectOpenParams,
  ) => {
    if (open) {
      setOpenedCellData({ id: cellId, parentId });
    } else {
      setOpenedCellData(null);
    }
  };

  /**
   * Формируем колонки таблицы
   */
  const columns: ColumnsType<IDataSource> = [
    {
      title: "",
      render: (_, __, index: number) => index + 1,
    },
    ...Array.from({ length: 5 }, (_, index) => {
      const level = index + 1;
      return {
        title: `Уровень ${level}`,
        render: (_: string, record: IDataSource) => {
          const row = record.key;
          const cellId = `${level}.${row}`;
          const parentId = level - 1 ? `${level - 1}.${record.key}` : null;

          return (
            <Select
              value={selectedOptions[cellId]?.id}
              style={{ width: "100%" }}
              showSearch
              placeholder="Search"
              onSearch={onSearch}
              filterOption={true}
              onChange={(value: string) => {
                handleSelectChange({ value, row, level, cellId });
              }}
              onDropdownVisibleChange={(open) =>
                handleOpen(open, {
                  cellId,
                  parentId,
                })
              }
              notFoundContent={
                searchValue ? (
                  <>
                    <Button onClick={() => handleAddOption(parentId)}>
                      Добавить
                    </Button>
                    {errorId === cellId && (
                      <span className={css.errorText}>
                        Добавляемое значение не соответсвует формату
                        "number.number"
                      </span>
                    )}
                  </>
                ) : (
                  "Нет данных"
                )
              }
            >
              {filteredOptions}
            </Select>
          );
        },
      };
    }),
  ];

  /**
   * Формируем массив строк для таблицы
   */
  const dataSource: IDataSource[] = useMemo(
    () =>
      rowCount > 0
        ? Array.from({ length: rowCount }, (_, index) => ({ key: index + 1 }))
        : [],
    [rowCount],
  );

  return (
    <div>
      <Table<IDataSource>
        virtual
        scroll={{ y: 700 }}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowKey="key"
      />

      <Flex gap="middle">
        <InputNumber
          type="number"
          value={rowCountInputValue}
          onChange={handleInputChange}
        />
        <Button onClick={addRow}>Добавить строку</Button>
      </Flex>

      <Flex gap="middle">
        <Button onClick={handleSave}>Сохранить</Button>
      </Flex>
    </div>
  );
};

export default App;
