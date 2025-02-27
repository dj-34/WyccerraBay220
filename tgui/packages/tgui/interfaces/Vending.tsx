import { classes, BooleanLike } from 'common/react';
import { capitalizeAll } from 'common/string';
import { useBackend, useLocalState } from '../backend';
import {
  Button,
  Icon,
  Section,
  Stack,
  Tooltip,
  Dimmer,
  NoticeBox,
  LabeledList,
  Input,
} from '../components';
import { Window } from '../layouts';

export type VendingData = {
  vend_ready: BooleanLike;
  message_err: BooleanLike;
  speaker: BooleanLike;
  panel: BooleanLike;
  mode: BooleanLike;
  isSilicon: BooleanLike;
  product: string;
  image: string;
  price: number;
  coin: string;
  message: string;
  products: Product[];
};

type Product = {
  key: string;
  name: string;
  price: number;
  category: number;
  ammount: number;
  image: string;
};

export const Vending = (props, context) => {
  const { act, data } = useBackend<VendingData>(context);
  return !data.panel ? <VendingMain /> : <VendingMaint />;
};

export const VendingMaint = (props, context) => {
  const { act, data } = useBackend<VendingData>(context);
  const { speaker } = data;
  return (
    <Window width={375} height={175}>
      <Window.Content>
        <Stack fill vertical>
          <NoticeBox>Панель открыта, проводится тех. обслуживание.</NoticeBox>
          <Stack.Item grow>
            <Section fill title="Параметры">
              <LabeledList>
                <LabeledList.Item
                  label="Динамик"
                  buttons={
                    <Button
                      content={speaker ? 'On' : 'Off'}
                      selected={speaker}
                      icon={speaker ? 'volume-up' : 'volume-mute'}
                      color={speaker ? '' : 'bad'}
                      onClick={() => act('togglevoice')}
                    />
                  }
                />
              </LabeledList>
            </Section>
          </Stack.Item>
        </Stack>
      </Window.Content>
    </Window>
  );
};

export const VendingMain = (props, context) => {
  const { act, data } = useBackend<VendingData>(context);
  const { coin, vend_ready, products = [] } = data;
  const [searchText, setSearchText] = useLocalState(context, 'searchText', '');
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );
  return (
    <Window width={products.length > 25 ? '391' : '375'} height={550}>
      {!vend_ready || data.mode ? <Vend /> : ''}
      <Window.Content>
        <Section
          fill
          scrollable
          title="Продукты"
          buttons={
            <>
              {coin ? (
                <Button
                  mr={1}
                  content="Достать монетку"
                  disabled={data.isSilicon}
                  tooltip="Вы не можете достать монетку."
                  onClick={() => act('remove_coin')}
                />
              ) : null}
              <Input
                width={10.5}
                placeholder="Поиск..."
                value={searchText}
                onInput={(e, value) => setSearchText(value)}
              />
            </>
          }
        >
          {filteredProducts.map((product) => (
            <Tooltip
              key={product.key}
              content={
                <>
                  {<b>{capitalizeAll(product.name)}</b>}
                  <br />
                  <br />
                  (В наличии: <b>{product.ammount}</b>)
                </>
              }
            >
              <Stack.Item
                inline
                grow
                className={classes([
                  'Vending__Button',
                  product.category === 2 && 'Vending__Button--contraband',
                  product.category === 4 && 'Vending__Button--premium',
                  product.ammount <= 0 && 'Vending__Button--disabled',
                ])}
                onClick={() =>
                  product.ammount > 0 && act('vend', { vend: product.key })
                }
              >
                <img
                  src={`data:image/jpeg;base64,${product.image}`}
                  style={{
                    width: '64px',
                    '-ms-interpolation-mode': 'nearest-neighbor',
                  }}
                />
                <Stack.Item
                  bold
                  className={classes([
                    'Vending__Price',
                    product.category === 2 && 'Vending__Price--contraband',
                    product.category === 4 && 'Vending__Price--premium',
                    product.ammount <= 0 && 'Vending__Price--disabled',
                  ])}
                >
                  {product.ammount > 0
                    ? product.price > 0
                      ? `${product.price} ₸`
                      : product.category === 4
                        ? 'Coin'
                        : 'Free'
                    : 'Empty'}
                </Stack.Item>
              </Stack.Item>
            </Tooltip>
          ))}
        </Section>
      </Window.Content>
    </Window>
  );
};

const Vend = (props, context) => {
  const { act, data } = useBackend<VendingData>(context);
  return data.mode ? (
    <Dimmer textAlign="center">
      {!data.message_err ? (
        <NoticeBox
          height="22px"
          width={data.products.length > 25 ? '375px' : '360px'}
          fontSize={0.95}
        >
          Для оплаты, проведите картой или вставьте деньги.
        </NoticeBox>
      ) : (
        <NoticeBox
          height="22px"
          width={data.products.length > 25 ? '375px' : '360px'}
          color="bad"
          fontSize={0.84}
        >
          {data.message}
        </NoticeBox>
      )}
      <Stack.Item mt={15} color="label">
        <h2>Вы покупаете</h2>
      </Stack.Item>
      <Stack.Item>
        <h1>{capitalizeAll(data.product)}</h1>
      </Stack.Item>
      <img
        src={`data:image/jpeg;base64,${data.image}`}
        style={{
          width: '140px',
          '-ms-interpolation-mode': 'nearest-neighbor',
        }}
      />
      <Stack.Item color="label">
        <h2>К оплате</h2>
      </Stack.Item>
      <Stack.Item>
        <h1>{data.price} ₸</h1>
      </Stack.Item>
      <Stack.Item grow>
        <Button
          fluid
          mt={15.5}
          lineHeight={2}
          content={'Отмена'}
          onClick={() => act('cancelpurchase')}
        />
      </Stack.Item>
    </Dimmer>
  ) : (
    <Dimmer textAlign="center">
      <Icon name="smile" size="7" color="yellow" />
      <Stack.Item color="label" mt={5}>
        <h1>Наслаждайтесь!</h1>
      </Stack.Item>
    </Dimmer>
  );
};
